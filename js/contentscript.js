injectScript(chrome.extension.getURL('/js/'), 'inject.js');

function injectScript(aBasePath, aScriptURL){
	var scriptEl = document.createElement( "script" );
	scriptEl.src = aBasePath + aScriptURL;
	scriptEl.async = false;

	(document.body || document.head || document.documentElement).appendChild(scriptEl);
}

function parseURL(url){
	var data= {};
	var url_frags= url.match(/(table|articleIndex)=([^&#]+)/g);
	for(var i in url_frags){
		var tmp= url_frags[i].split('=');
		data[tmp[0]]= tmp[1];
	}
	return data;
}

function parseTime(time_str){
	var time_arr= time_str.replace(/[-:\s]/g, ',').split(',');
	var date= new Date('20'+time_arr[0], time_arr[1] - 1, time_arr[2], time_arr[3], time_arr[4], time_arr[5]);
	return date.getTime();
}

var bookmark= {
	find_rethread: 0,
	init: function(){
		var request= {
			'action': 'find',
			'table': 'fav_rethreads',
			'filter': 'articleIndex',
			'key': url_frags.articleIndex * 1
		}
		chrome.runtime.sendMessage(request, function(response){
			bookmark.btn_init(response.result, {'table_id': url_frags.table, 'articleIndex' : url_frags.articleIndex});
		});
		if(this.find_rethread > 0) this.find();
	},
	btn_init: function(data, thread_info){
		if(thread_info.articleIndex == null) return false;
		var comments_arr= [];
		for(idx in data){
			var comment= data[idx];
			comments_arr.push(comment.rethreadIndex);
		}
		var $comments= $('table.commentList div[id^=commentItem_]:not(.commentList_th_body)');
		$comments.css('position', 'relative');
		$comments.each(function(){
			var rethread_idx= $(this).attr('id').substr($(this).attr('id').indexOf('_')+1);
			var $bookmark= $('<a>').addClass('rethread_bookmark').attr({
				'href': '#addBookmark',
				'data-ridx': rethread_idx
			});
			if(comments_arr.indexOf(rethread_idx * 1) < 0){
				$bookmark.addClass('unsubscribe');
			} else {
				$bookmark.addClass('subscribe');
			}
			$(this).prepend($bookmark);
		});
		$('div[id^=commentItem_]').on('click', '.rethread_bookmark', thread_info, bookmark.btn_control);
	},
	btn_control: function(event){
		var $target= $(this);
		var request= {}
		request.table= 'fav_rethreads';
		if($target.hasClass('unsubscribe')){
			request.action= 'add';
			request.data= {
				'table_id': event.data.table_id,
				'articleIndex': event.data.articleIndex * 1,
				'title': scrap.getTitle(),
				'rethreadIndex': $target.attr('data-ridx') * 1
			}
			var $contents_td= $('div#commentItem_'+request.data.rethreadIndex+' td.commentList_td');
			request.data.content= $contents_td.text();
			if($contents_td.find('img').size() > 0){
				var $thumb_img= $contents_td.find('img').eq(0).removeAttr('style').removeAttr('width').removeAttr('height');
				request.data.content= $thumb_img[0].outerHTML+' '+request.data.content;
			}
			request.data.last_update= parseTime($('div#commentItem_'+request.data.rethreadIndex+' span[onclick^=ToggleDateFormat]').attr('title'));
		} else {
			request.action= 'delete';
			request.key= $target.attr('data-ridx') * 1;
		}
		chrome.runtime.sendMessage(request, function(response){
			if(request.action == 'add'){
				$target.removeClass('unsubscribe').addClass('subscribe');
			} else {
				$target.removeClass('subscribe').addClass('unsubscribe');
			}
		});
		return false;
	},
	find: function(){
		var $comments= $('table.commentList div[id^=commentItem_]:not(.commentList_th_body)');
		var first_idx= $comments.eq(0).attr('id').substr('commentItem_'.length) * 1;
		if(first_idx > this.find_rethread){
			var $pagings= $('.commentList .page a');
			var current= $pagings.index($('.commentList .page a.focus'));
			$pagings.eq(current + 1)[0].click();
		} else {
			$('html, body').animate({
				scrollTop: $('#commentItem_'+bookmark.find_rethread).offset().top
			}, 'fast');
			this.find_rethread= 0;
		}
	}
}

var scrap= {
	subscribe_txt: '여기에 한 번 누워볼까 ㅇㅅㅇ)9',
	unsubscribe_txt: '이부자리 뺄게여. 그동안 감사했어여. ㅇㅅㅇ)/[안녕]',
	sub_res_txt: '성공적으로 자리를 깔았습니다.',
	unsub_res_txt: '성공적으로 자리를 뺐습니다.',
	init: function(){
		var request= {
			'action': 'get',
			'table': 'my_threads',
			'key': url_frags.articleIndex * 1
		};
		chrome.runtime.sendMessage(request, function(response){
			scrap.btn_init(response.result);
		});
	},
	btn_init: function(data){
		var $btn= $('<a class="scrap_btn">').attr('href', '#');
		if(typeof data != 'undefined' && data !== null){
			scrap.update(data);
			$btn.text(scrap.unsubscribe_txt).addClass('unsubscribe');
		} else {
			$btn.text(scrap.subscribe_txt).addClass('subscribe');
		}
		$('table.articleView.fixed-table').after($btn);
		$('body').on('click', '.scrap_btn', function(){
			if($(this).hasClass('subscribe')){
				scrap.add(0);
			} else {
				scrap.delete(data.articleIndex);
			}
			return false;
		});
	},
	btn_reset: function(condition){
		if(condition == 'subscribe'){
			$('.scrap_btn').text(scrap.unsubscribe_txt).removeClass('subscribe').addClass('unsubscribe');
		} else {
			$('.scrap_btn').text(scrap.subscribe_txt).removeClass('unsubscribe').addClass('subscribe');
		}
	},
	add: function(thread_type){
		var data= {
			'articleIndex': url_frags.articleIndex * 1,
			'table_id': url_frags.table,
			'title': scrap.getTitle(),
			'last_update': parseTime($('.articleView_th:contains(\'마지막 댓글\') + td > span').attr('title')),
			'checked': new Date().getTime(),
			'type': thread_type
		}
		var request= {
			'action': 'add',
			'table': 'my_threads',
			'data': data
		}
		chrome.runtime.sendMessage(request, function(response){
			scrap.btn_reset('subscribe');
			if(response.result) alert(scrap.sub_res_txt);
		});
	},
	update: function(data){
		var new_data= {
			'articleIndex': data.articleIndex,
			'table_id': data.table_id,
			'title': scrap.getTitle(),
			'last_update': parseTime($('.articleView_th:contains(\'마지막 댓글\') + td > span').attr('title')),
			'type': data.type
		}
		new_data.checked= new_data.last_update;
		var request= {
			'action': 'update',
			'table': 'my_threads',
			'data': new_data
		}
		chrome.runtime.sendMessage(request, function(response){
			console.log('Update Complete!');
		});
	},
	delete: function(articleIndex){
		var request= {
			'action': 'delete',
			'table': 'my_threads',
			'key': articleIndex
		};
		chrome.runtime.sendMessage(request, function(response){
			scrap.btn_reset('unsubscribe');
			if(response.result) alert(scrap.unsub_res_txt);
		});
	},
	getTitle: function(){
		var title= $('.articleView .articleView_th b').text().trim();
		return title;
	}
}

var url_frags= parseURL(window.location.href);

if(window.location.href.indexOf('#commentItem_') > -1) bookmark.find_rethread= window.location.href.substr(window.location.href.indexOf('#commentItem_') + '#commentItem_'.length);
if(document.referrer == 'http://bbs.daepiso.com/MBXE/Article_Write_Post.jsp') scrap.add(1);

scrap.init();

window.addEventListener('message', function(event){
	eval(event.data.callback+'()');
});