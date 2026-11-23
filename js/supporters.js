/* Renders window.SUMMIT_SUPPORTERS into #supporters-root and optional #home-logos. Works from file:// (no fetch). */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function entryClass(entry) {
    return entry && entry.darkTile ? ' class="is-dark"' : '';
  }

  function tile(entry, layout) {
    var name = esc(entry.name);
    var note = entry.note ? '<span class="supporter-note">' + esc(entry.note) + '</span>' : '';
    var img = entry.logo
      ? '<img alt="' + name + '" src="' + esc(entry.logo) + '"/>'
      : '';
    var cls = 'supporter-tile' + (entry.logo ? '' : ' is-text') + (layout === 'cards' ? ' is-card' : '') + (entry.darkTile ? ' is-dark' : '');
    var inner = img + '<span class="supporter-name">' + name + '</span>' + note;
    if (entry.url) {
      var isExt = /^https?:/i.test(entry.url);
      var extra = isExt ? ' target="_blank" rel="noopener"' : '';
      return '<a class="' + cls + '" href="' + esc(entry.url) + '"' + extra + '>' + inner + '</a>';
    }
    return '<div class="' + cls + '">' + inner + '</div>';
  }

  function groupHtml(group) {
    var entries = group.entries || [];
    var body;
    if (!entries.length) {
      body = '<p class="empty-note">' + esc(group.empty || 'None listed yet.') + '</p>';
    } else {
      var layout = group.layout || 'tiles';
      var gclass = 'supporter-grid' + (layout === 'cards' ? ' cards' : '');
      body = '<div class="' + gclass + '">' + entries.map(function (e) { return tile(e, layout); }).join('') + '</div>';
    }
    return (
      '<div class="supporter-group" id="' + esc(group.id) + '">' +
        '<h3>' + esc(group.title) + '</h3>' +
        (group.intro ? '<p>' + esc(group.intro) + '</p>' : '') +
        body +
      '</div>'
    );
  }

  function uniqueLogos(data) {
    var seen = {};
    var out = [];
    (data.groups || []).forEach(function (g) {
      (g.entries || []).forEach(function (e) {
        if (!e.logo || seen[e.logo]) return;
        seen[e.logo] = true;
        out.push(e);
      });
    });
    return out;
  }

  function render() {
    var data = window.SUMMIT_SUPPORTERS;
    if (!data) return;
    var root = document.getElementById('supporters-root');
    if (root) {
      var navCats = [];
      var seenCat = {};
      (data.groups || []).forEach(function (g) {
        if (seenCat[g.category]) return;
        seenCat[g.category] = true;
        navCats.push({ category: g.category, id: g.id });
      });
      var nav = '<nav class="supporter-nav" aria-label="Supporter groups">' +
        navCats.map(function (c) {
          return '<a href="#' + esc(c.id) + '">' + esc(c.category) + '</a>';
        }).join('') +
        '</nav>';
      root.innerHTML = nav + (data.groups || []).map(groupHtml).join('');
    }
    var logos = document.getElementById('home-logos');
    if (logos) {
      logos.innerHTML = uniqueLogos(data).map(function (e) {
        var img = '<img alt="' + esc(e.name) + '" src="' + esc(e.logo) + '"/>';
        var fig = entryClass(e);
        if (e.url && /^https?:/i.test(e.url)) {
          return '<figure' + fig + '><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + img + '</a></figure>';
        }
        if (e.url) {
          return '<figure' + fig + '><a href="' + esc(e.url) + '">' + img + '</a></figure>';
        }
        return '<figure' + fig + '>' + img + '</figure>';
      }).join('');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
