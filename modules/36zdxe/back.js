/* header/menu v2.1 — token/hamburger/dropdown; pagesetting yoksa {{html}} sızmaz;
   dil chip (logo satırı / drawer); langCount<=1 boş; logo/web-name fallback. */
try {
  var wxPublicSlug = function (it) {
    if (!it) return "";
    var n = it.pathnext;
    if (n != null && String(n).trim() !== "") return String(n).trim();
    return it.path != null ? String(it.path) : "";
  };

  var menu1ItemLabel = function (it) {
    if (!it || !it.name) return "";
    return wmPickLang(it.name, json.lang);
  };

  var menu1ResolveBucketKey = function (parentItem) {
    var tryKey = function (key) {
      if (!key || !webmakerdata[key] || !webmakerdata[key].data || !webmakerdata[key].data.length) {
        return "";
      }
      return key;
    };
    var fromPath = tryKey(parentItem.path);
    if (fromPath) return fromPath;
    var fromId = tryKey(parentItem.id);
    if (fromId) return fromId;
    var pnext = parentItem.pathnext;
    if (pnext != null && String(pnext).trim() !== "" && webmakerdata.pagesetting && webmakerdata.pagesetting.data) {
      var slug = String(pnext).trim();
      var psRows = webmakerdata.pagesetting.data;
      for (var pi = 0; pi < psRows.length; pi++) {
        var catRow = psRows[pi];
        if (!catRow || !catRow.path || catRow.path === "page" || catRow.path === "category") continue;
        var bucket = webmakerdata[catRow.path];
        if (!bucket || !bucket.data || !bucket.data.length) continue;
        for (var di = 0; di < bucket.data.length; di++) {
          var row = bucket.data[di];
          if (row && (row.path === slug || row.pathnext === slug)) {
            return catRow.path;
          }
        }
      }
    }
    return parentItem.path != null ? String(parentItem.path) : "";
  };

  /* Sade CollectSubPages — menu-2 kalıbının hafif kopyası (mega yok) */
  var menu1CollectSubPages = function (parentItem) {
    var out = [];
    var seen = {};
    var pushSub = function (sub) {
      if (!sub || sub.status !== "play") return;
      var key = (sub.id != null ? String(sub.id) : "") || (sub.path != null ? String(sub.path) : "");
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(sub);
    };
    var readBucket = function (bucketKey) {
      if (!bucketKey || !webmakerdata[bucketKey] || !webmakerdata[bucketKey].data) return;
      var arr = webmakerdata[bucketKey].data;
      for (var i = 0; i < arr.length; i++) {
        pushSub(arr[i]);
      }
    };
    var bucketKey = menu1ResolveBucketKey(parentItem);
    if (bucketKey) {
      readBucket(bucketKey);
    }
    if (webmakerdata.pagesetting && webmakerdata.pagesetting.data && parentItem.id) {
      var pagesettingForCat = webmakerdata.pagesetting.data.find(
        function (item) { return item.modulestatus && item.modulestatus.page; }
      );
      if (pagesettingForCat && webmakerdata[pagesettingForCat.path] && webmakerdata[pagesettingForCat.path].data) {
        var rootList = webmakerdata[pagesettingForCat.path].data;
        for (var j = 0; j < rootList.length; j++) {
          var pg = rootList[j];
          if (pg.status === "play" && pg.category === parentItem.id) {
            pushSub(pg);
          }
        }
      }
    }
    return out;
  };

  var menu1BuildDropdown = function (parentItem, currentSlug) {
    var subs = menu1CollectSubPages(parentItem);
    if (!subs.length) return "";
    var inner = "";
    for (var s = 0; s < subs.length; s++) {
      var sub = subs[s];
      var subSlug = wxPublicSlug(sub);
      var subActive = currentSlug === subSlug ? ' class="modulex-menu-active"' : "";
      inner += "<a" + subActive + ' href="' + wxLangInternalHref(subSlug) + '">' + menu1ItemLabel(sub) + "</a>";
    }
    return '<div class="dropdown-content-modulex">' + inner + "</div>";
  };

  var menu1BranchActive = function (parentItem, currentSlug) {
    if (wxPublicSlug(parentItem) === currentSlug) return true;
    var subs = menu1CollectSubPages(parentItem);
    for (var i = 0; i < subs.length; i++) {
      if (wxPublicSlug(subs[i]) === currentSlug) return true;
    }
    return false;
  };

  var pagesettingjson = webmakerdata.pagesetting && Array.isArray(webmakerdata.pagesetting.data)
    ? webmakerdata.pagesetting.data.find(
        function (item) { return item.modulestatus && item.modulestatus.page; }
      )
    : null;

  var currentPagePath = wxPublicSlug(page);
  var backhtml = '<a href="' + wxLangInternalHref("") + '">@home@</a>';

  if (pagesettingjson && webmakerdata[pagesettingjson.path] && Array.isArray(webmakerdata[pagesettingjson.path].data)) {
    var rootData = webmakerdata[pagesettingjson.path].data;
    for (var ri = 0; ri < rootData.length; ri++) {
      var iterator = rootData[ri];
      if (iterator.status === "play" && iterator.category === "") {
        var parentSlug = wxPublicSlug(iterator);
        var dropdownHtml = menu1BuildDropdown(iterator, currentPagePath);
        var isActive = menu1BranchActive(iterator, currentPagePath);
        var linkActive = parentSlug === currentPagePath;

        if (dropdownHtml !== "") {
          var wrapClass = "modulexmenulist-menu";
          if (isActive) {
            wrapClass += " dropdown-content-active-modulex";
          }
          var linkClass = linkActive || isActive ? ' class="modulex-menu-active"' : "";
          backhtml +=
            '<div class="' +
            wrapClass +
            '"><a' +
            linkClass +
            ' href="' +
            wxLangInternalHref(parentSlug) +
            '">' +
            menu1ItemLabel(iterator) +
            "</a>" +
            dropdownHtml +
            "</div>";
        } else {
          if (linkActive || isActive) {
            backhtml +=
              '<a class="modulex-menu-active" href="' +
              wxLangInternalHref(parentSlug) +
              '">' +
              menu1ItemLabel(iterator) +
              "</a>";
          } else {
            backhtml +=
              '<a href="' + wxLangInternalHref(parentSlug) + '">' + menu1ItemLabel(iterator) + "</a>";
          }
        }
      }
    }
  }
  /* Placeholder replace koşulsuz — pagesetting yoksa bile {{html}} sızmasın */
  html = html.replace(/{{html}}/g, backhtml);

  langhtml = "";
  var langCount = 0;
  var hm1Langs = (webmakerdata.setting && webmakerdata.setting.langs) ? webmakerdata.setting.langs : {};
  for (var key in hm1Langs) {
    if (hm1Langs[key] === true) {
      langCount++;
      var langUrl = wxLangHref(key, currentPagePath || "");
      langhtml += typeof wmLangLi === "function" ? wmLangLi(key, langUrl, { style: "text" }) : "<li><a href=\"" + langUrl + "\">" + String(key).toUpperCase() + "</a></li>"; /* G1 */
    }
  }
  if (langCount <= 1) {
    langhtml = "";
  }
  html = html.replace(/{{langhtml}}/g, langhtml);

  /* Logo / site adı: preview kırığı önleme */
  var menu1Logo =
    webmakerdata.setting && webmakerdata.setting.logo
      ? String(webmakerdata.setting.logo)
      : "logo.svg";
  html = html.replace(/{{logo}}/g, menu1Logo);
  if (webmakerdata.setting && webmakerdata.setting.name) {
    var menu1SiteName = menu1ItemLabel({ name: webmakerdata.setting.name });
    if (menu1SiteName) {
      html = html.replace(/{{web-name}}/g, menu1SiteName);
    }
  }
} catch (error) {
  console.log("menu back.js", error);
}
