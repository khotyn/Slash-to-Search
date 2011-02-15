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
				var reg = new RegExp(u2sMappings[i].url)
				if (document.URL.match(reg)) {
				searchQuery = document.getElementById(u2sMappings[i].search_id);
				if(searchQuery != null && document.activeElement != searchQuery && document.activeElement.nodeName != 'TEXTAREA' && document.activeElement.nodeName != 'INPUT') {
				setTimeout('focusQuery()', 10);
				}
				}
				}
				});
	}
}

document.onkeydown= keyPress;
