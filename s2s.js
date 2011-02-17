var searchQuery;

chrome.extension.sendRequest({'type': 'get_map_data'}, function(response) {
		var u2sMappings = response.u2sMappings;
		for (var i = 0; i < u2sMappings.length; i++) {
		var reg = new RegExp(u2sMappings[i].url)
		if(document.URL.match(reg)) {
			chrome.extension.sendRequest({'type': 'get_tab_id'}); 
		}
		}
	});

function focusQuery(){
	searchQuery.focus();
}

function keyPress() {
	var key = event.keyCode;

	if(key == 191) {
		chrome.extension.sendRequest({'type': 'get_map_data'}, function(response){
				var u2sMappings = response.u2sMappings;
				for(var i = 0; i < u2sMappings.length; i++) {
					var match = false;	
					if(u2sMappings[i].type == 'regex' ) {
						match = document.URL.match(new RegExp(u2sMappings[i].url));
					} else {
						match = (document.URL == u2sMappings[i].url);
					}
					if (match) {
						var indexes = u2sMappings[i].tree_route.split(' ');
						searchQuery = $('body');
						for(var j = 0; j < indexes.length - 1; j++) {
							searchQuery = searchQuery.children().eq(indexes[j]);
						}
						searchQuery = searchQuery.get(0);
						if(searchQuery != null && document.activeElement != searchQuery && document.activeElement.nodeName != 'TEXTAREA' && document.activeElement.nodeName != 'INPUT') {
							setTimeout('focusQuery()', 10);
						}
					}
				}
			}
		);
	}
}

function send_ele_id(event) {
	if(event.button == 2) {
		var tree_route = '';
		var ele = $(event.target);

		while (ele.attr('nodeName') != 'BODY') {
			tree_route = ele.prevAll().size() + ' ' + tree_route;
			ele = ele.parent();
		}
		chrome.extension.sendRequest({'type': 'send_ele_id', 'tree_route': tree_route})			
	}
}

document.onkeydown= keyPress;
document.onmousedown = send_ele_id;
