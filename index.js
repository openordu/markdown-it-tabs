// Process ```lang [group:tab]

'use strict';

module.exports = function (md, opts) {
    var defaultRender = md.renderer.rules.fence,
        unescapeAll = md.utils.unescapeAll,
        // [group:tab], :tab is optional
        re = /\[(\w*)(?::([\w ]*))?\]/;

    function getInfo(token) {
        return token.info ? unescapeAll(token.info).trim() : '';
    }

    function getGroupAndTab(token) {
        var info = getInfo(token),
            [group = null, tab = ''] = (re.exec(info) || []).slice(1);
        return [group, tab];
    }

    function getLangName(token) {
        var info = getInfo(token);
        return info ? info.split(/(\s+)/g)[0] : '';
    }

    function fenceGroup(tokens, idx, options, env, slf) {
        if (tokens[idx].hidden) { return ''; }

        const [GROUP, _] = getGroupAndTab(tokens[idx]);
        if (GROUP === null) {
            return defaultRender(tokens, idx, options, env, slf);
        }
        
        var token, group, tab, checked, labels = '', pres = '';
        for (let i = idx; i < tokens.length; i++) {
            token = tokens[i];
            [group, tab] = getGroupAndTab(token);
            if (group !== GROUP) { break; }

            token.info = token.info.replace(re, '');
            token.hidden = true;

            checked = i - idx > 0 ? '' : ' checked';
            labels += `<li><input class="markdown-it-tab" type="radio" name="label-group-${idx}"${checked}>` +
                `<label for="group-${idx}-tab-${i - idx}" onclick="this.previousElementSibling.click()">${tab || getLangName(token)}</label></li>\n`;

            md.renderer.rules.fence = originalFenceRule;

            pres += `<input type="radio" class="markdown-it-tab-content" id="group-${idx}-tab-${i - idx}" name="group-${idx}"${checked}>\n<div class="tab-content">` +
                md.render(defaultRender(tokens, i, options, env, slf).replace(/<(\/)?(pre|code)[^>]*>/g, '')) + "</div>";

            md.renderer.rules.fence = fenceGroup;
        }

        // Unset the custom fence rule

        // var cleanedValue = pres.replace(/<(\/)?(pre|code)[^>]*>/g, '');
        // cleanedValue = cleanedValue.replace(/~~~(\w*)\n([\s\S]*?)\n~~~/g, (match, lang, content) => {
        //     return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${content}</code></pre>`;
        //   }).replace(/`([^`]+)`/g, '<code>$1</code>')
    
        return  '<div class="code-tabs">\n<ul>\n' + labels + '</ul>\n' + pres + '</div>';
    }
    // Store the original fence rule in a variable
    const originalFenceRule = md.renderer.rules.fence;
    
    md.renderer.rules.fence = fenceGroup;
};
