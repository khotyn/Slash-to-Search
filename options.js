var bg_obj = chrome.extension.getBackgroundPage();

function remove_rules(){
    localStorage.removeItem('u2sMappings');
    show_rules();
}

function add_rules(url, type, tree_route){
    if (url == undefined || url.trim() == '' || type == undefined || type.trim() == '' || tree_route == undefined || tree_route.trim() == '') {
        return;
    }
    
    var u2sMappings = localStorage["u2sMappings"];
    
    if (u2sMappings == undefined) {
        var jsonObj = {
            "u2sMappings": [{
                "id": 1,
                "url": url,
                "type": type,
                'tree_route': tree_route
            }],
            "maxId": 1
        };
        localStorage["u2sMappings"] = JSON.stringify(jsonObj);
    }
    else {
        var u2sJson = JSON.parse(u2sMappings);
        var jsonObj = [{
            "id": ++u2sJson.maxId,
            "url": url,
            "type": type,
            'tree_route': tree_route
        }];
        u2sJson.u2sMappings = u2sJson.u2sMappings.concat(jsonObj);
        localStorage["u2sMappings"] = JSON.stringify(u2sJson);
    }
}

function add_rule_btn(){
    var url = $('#url').attr('value');
    var type = $('#type').attr('value');
    var tree_route = $('#tree_route').attr('value');
    add_rules(url, type, tree_route);
    $('#url').attr('value', '');
    $('#type').attr('value', '');
    $('#tree_route').attr('value', '');
    show_rules();
    toggle_show_add_rules(); // to hide the add rule layer.
}

function show_rules(){
    var u2sMappings = localStorage["u2sMappings"];
    $('#rules > table').children().remove();
    $('#no_rules').remove();
    
    if (u2sMappings != undefined) {
        $('#rules > table').append('<tr><th width="50%">URL</th><th width="25%">Type</th><th width="25%">Edit</th><tr>');
        var jsonObj = JSON.parse(u2sMappings);
        
        for (var count = 0; count < jsonObj.u2sMappings.length; count++) {
            $('#rules > table').append('<tr><td><div>' + jsonObj.u2sMappings[count].url + '</div></td><td>' + jsonObj.u2sMappings[count].type + '</td><td><button name="edit">Edit</button><button name="delete">Delete</button><input type="hidden" value="' + jsonObj.u2sMappings[count].id + '"/></td></tr>');
        }
        
        $('button[name=edit]').bind('click', edit_rule);
        $('button[name=delete]').bind('click', remove_rule);
    }
    else {
        $('#rules').append('<p id="no_rules" class="no_rules">No rules currently, try to add one?</p>')
    }
}

function toggle_show_popwin(id, focus){
    if ($(id).css('visibility') == 'visible') {
        $(id).css('visibility', 'hidden');
    }
    else {
        var windowWidth = document.body.clientWidth;
        var windowHeight = document.body.clientHeight;
        var popwinWidth = $(id).width();
        var popwinHeight = $(id).height();
        $(id).css('left', (windowWidth - popwinWidth) / 2).css('top', (windowHeight - popwinHeight) / 2).css('visibility', 'visible');
        $(focus).focus();
    }
}

function edit_rule(event){
    var rule;
    var id = $(event.target).siblings().get(1).value;
    var u2sMappings = JSON.parse(localStorage['u2sMappings']).u2sMappings;
    
    for (var i = 0; i < u2sMappings.length; i++) {
        if (u2sMappings[i].id == id) {
            rule = u2sMappings[i];
            break;
        }
    }
    
    var tr = $(event.target).parent().parent();
    tr.children().remove();
    var option_ele;
    
    if (rule.type == 'regex') {
        option_ele = '<option value="normal">Normal</option><option value="regex" selected>Regex</option>';
    }
    else {
        option_ele = '<option value="normal" selected>Normal</option><option value="regex">Regex</option>';
    }
    
    tr.append('<td><input type="text" class="text" style="width:100%;" value="' + rule.url + '"/></td><td><select>' + option_ele + '</select></td><td><button name="done">Done</button><button name="delete">Delete</button><input type="hidden" value="' + rule.id + '"/></td>');
    $('button[name=done]').bind('click', save_rule);
    $('button[name=delete]').bind('click', remove_rule);
}

function save_rule(event){
    var id = $(event.target).siblings().get(1).value;
    var jsonObj = JSON.parse(localStorage['u2sMappings']);
    var u2sMappings = jsonObj.u2sMappings;
    var tr = $(event.target).parent().parent();
    var url = tr.children().slice(0, 1).children().slice(0, 1).attr('value');
    var type = tr.children().slice(1, 2).children().slice(0, 1).attr('value');
    
    if (url == undefined || url.trim() == '' || type == undefined || type.trim() == '') {
        alert('URL or type can\'t be empty!');
        return false;
    }
    
    for (var i = 0; i < u2sMappings.length; i++) {
        if (u2sMappings[i].id == id) {
            u2sMappings[i].url = url;
            u2sMappings[i].type = type;
            break;
        }
    }
    
    jsonObj.u2sMappings = u2sMappings;
    
    localStorage['u2sMappings'] = JSON.stringify(jsonObj);
    show_rules();
}

function remove_rule(event){
    var id = $(event.target).siblings().slice(1, 2).attr('value');
    var jsonObj = JSON.parse(localStorage['u2sMappings']);
    var u2sMappings = jsonObj.u2sMappings;
    
    for (var i = 0; i < u2sMappings.length; i++) {
        if (u2sMappings[i].id == id) {
            u2sMappings = u2sMappings.slice(0, i).concat(u2sMappings.slice(i + 1, u2sMappings.length));
            break;
        }
    }
    
    jsonObj.u2sMappings = u2sMappings;
    localStorage['u2sMappings'] = JSON.stringify(jsonObj);
    show_rules();
}

function export_rules(){
    var file_path;
    try {
        var data = localStorage['u2sMappings'];
        if (!data) {
            alert('No rule to export!');
            return;
        }
        file_path = bg_obj.plugin.writeTempFile(localStorage['u2sMappings'], "rules.json");
        
        if (!file_path || file_path.trim().length == 0) {
            throw 'Error';
        }
    } 
    catch (e) {
        alert('Unknown error!');
        return;
    }
    
    if (file_path.substr(0, 7) != 'file://') {
        file_path = 'file://' + file_path;
    }
    chrome.tabs.create({
        'url': file_path
    });
}

function toggle_show_add_rules(){
    toggle_show_popwin('#popwin', '#url');
}

function toggle_show_import_rules(){
    toggle_show_popwin('#import_online_rules_div', '#rule_url');
}

function import_rules(){
    var rule_url = $('#rule_url').attr('value');
    
    if (!rule_url || !(rule_url.substr(0, 7) == 'http://' || rule_url.substr(0, 8) == 'https://')) {
        alert('Empty url or invalid url!');
        return false;
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", rule_url, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                try {
                    var u2sMappings = JSON.parse(xhr.responseText).u2sMappings;
                    if (u2sMappings) {
                        for (var i = 0; i < u2sMappings.length; i++) {
                            add_rules(u2sMappings[i].url, u2sMappings[i].type, u2sMappings[i].tree_route);
                        }
                        $('#rule_url').attr('value', '');
                        show_rules();
                    }
                } 
                catch (e) {
                    alert('Invalid rule format');
                }
            }
        }
    }
    xhr.send();
    toggle_show_import_rules();
    return false;
}

$(function(){
    $('#remove_rules').bind('click', remove_rules);
    $('#close_img').bind('click', toggle_show_add_rules);
    $('#close_import_win').bind('click', toggle_show_import_rules);
    $('#add').bind('click', add_rule_btn);
    $('#export_rules').bind('click', export_rules);
    $('#import_rules').bind('click', toggle_show_import_rules);
    $('#import').bind('click', import_rules);
    show_rules();
    
    if (bg_obj.quick_add == true) {
        if (bg_obj.url != undefined && bg_obj.tree_route != undefined) {
            $('#url').attr('value', bg_obj.url);
            $('#tree_route').attr('value', bg_obj.tree_route);
        }
        
        bg_obj.quick_add = false;
        bg_obj.url = undefined;
        bg_obj.tree_route = undefined;
        setTimeout('toggle_show_add_rules()', 10);
    }
});
