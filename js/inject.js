var current_url= window.location.href;
var setBookmarkInterval= null;

function readyBookmark(){
	var $comments= $('table.commentList div[id^=commentItem_]:not(.commentList_th_body)');
	if($comments.size() > 0 && $comments.has('.rethread_bookmark').size() < 1){
		clearInterval(setBookmarkInterval);
		window.postMessage({'callback': 'bookmark.init'}, '*');
	}
}

window._GetCommentList_ImdaeYingyeo= window.GetCommentList;
window.GetCommentList= function(table, articleIndex, page, moveTop){
	console.log('call: '+page);
	var ret= window._GetCommentList_ImdaeYingyeo(table, articleIndex, page, moveTop);
	setBookmarkInterval= setInterval(readyBookmark, 500);
}

if(current_url.indexOf('articleIndex') > -1) setBookmarkInterval= setInterval(readyBookmark, 500);