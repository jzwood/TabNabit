document.addEventListener('DOMContentLoaded', function() {
	window.kill = false;
	keyHandling();//for closing tabs
	organizeTabs();
});

//checks to see if Alt is pressed
function keyHandling(){
	window.kill = false;
	window.addEventListener("keydown", function(e){//console.log(e.keyCode);
		if(e.keyCode == 18 && !window.kill){window.kill = true;}
	});
	window.addEventListener("keyup", function(e){window.kill = false;});
}

//sorts tabs then displays in square grid for easy navigation
function organizeTabs(){
	chrome.tabs.query({currentWindow:true}, function(tabs) { //selects all tabs from current window
		console.log(tabs);//check the console for more tab information
		//sorts array of obj's. Source: http://stackoverflow.com/users/43452/stobor
		tabs.sort(function(a, b) {
			return a['url'].localeCompare(b['url']);
		});
		var urllist = document.getElementById('tabs');
		for(var i in tabs){
			var tablen = tabs.length;
			if((i%Math.floor(Math.sqrt(tablen)) === 0 && tablen <= 7*7) || (tablen > 7*7 && i%6 === 0)){
				var row = document.createElement('tr');
				urllist.appendChild(row);//adds a new row to the table
			}
			//tabitem consists of entries in larger table
			var tabitem = document.createElement('td');
			tabitem.id = String(tabs[i]['id']);//sets <td id='tab.id'>
			tabitem.className = 'clickTab';
			row.appendChild(tabitem);
			//each tabitem has its data formatted in a table
			var formattedCell = document.createElement('table');
			tabitem.appendChild(formattedCell);

			var cellData = document.createElement('tr');
			formattedCell.appendChild(cellData);//there will only be ONE row per cell

			var iconTd = document.createElement('td');
			iconTd.className = 'icontd';
			cellData.appendChild(iconTd);//adding icon to cell

			var lengthLimit = 12,//max number of characters per line
					visibleText = 30,//max visible characters from title
					rawTitle = tabs[i]['title'].length>visibleText? tabs[i]['title'].slice(0,visibleText) + '...' : tabs[i]['title'] ;

			//puts space into URLs or other long text that throws off text spacing
			var cleanOnce = function(raw, visChars){
				var words = raw.split(' ');
				for(var w in words){
					var len = words[w].length;
					if(len > visChars){
						words[w] = words[w].slice(0,len/2) + ' ' + words[w].slice(Math.ceil(len/2),len);
					}
				}
				return words.join(' ');
			}
			var rawTitle = cleanOnce(cleanOnce(rawTitle, lengthLimit),lengthLimit);

			//second data entry to cell table. icon on left, textTd on right
			var textTd = document.createElement('td');
			textTd.className = "title";
			cellData.appendChild(textTd);

			var titleNode = document.createTextNode(rawTitle);
			textTd.appendChild(titleNode);

			var iconDim = 32,
					img = new Image(iconDim,iconDim),//width, height
					iconUrl = tabs[i]['favIconUrl'];

			var pattern = /png|jpg|ico/g;//acceptable icon extensions
			if(pattern.test(iconUrl)){ //only adds icon image if one is found
				img.src = iconUrl;
			}else{
				img.src = "/images/default.png";
			}
			iconTd.appendChild(img);
		}
		//iterates through every entry in the table and attaches a listener
		var addListeners = function addTableListeners(){
			for (var i = 0; i < urllist.children.length; i++) {
				for(var j = 0; j < urllist.children[i].children.length; j++){
					var childElement = urllist.children[i].children[j];
					childElement.addEventListener('click', function(){
						chrome.tabs.get(parseInt(this.id), function(mytab){
							if(!mytab['active']){//can't modify/select active tab
								if(window.kill){
									var tableCell = document.getElementById(mytab.id);
									tableCell.parentNode.removeChild(tableCell);//removes tab from table in html
									chrome.tabs.remove(parseInt(mytab.id));//removes tab from browser
								}else{ //select new tab to be active
									chrome.tabs.update(parseInt(mytab.id), {active:true});//no callback necessary
								}
							}
						});
					});
				}
			}
		}
	addListeners();//connects mouse clicks on table with browser's tabs
	//end of chrome.tabs.query
	});
}
