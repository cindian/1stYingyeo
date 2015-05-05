imdae_yingyeo.bbs= {
  'notice': '이용안내',
  'admin': '관리자 문의',
  'defect': '불량품 전시',
  'sales': '영업',
  'qna': '질의응답',
  'link': '링크공유',
  'dmz_new': 'DMZ',
  'free': '자유게시판',
  'dark': '어둠에다크',
  'dark_new': '빠가',
  'game': '게임',
  'study': '공부',
  'horror': '공포',
  'normal': '노말',
  'book': '도서',
  'animal': '동물',
  'plant': '식물',
  'dongin': '동인',
  'mybook': '회지홍보',
  'cosmetic': '미용',
  'mil': '밀리터리',
  'lily': '백합',
  'sasa': 'New 사건,사고',
  'fi': '설정놀이',
  '18x': '성',
  'voice': '성우',
  'ggomul': '수공예,장난감',
  'sports': '스포츠',
  'it': 'IT',
  'animan': '애니,만화',
  'trip': '여행',
  'history': '역사',
  'tv': '연예',
  'idol': '아이돌',
	'humor': '유머',
  'strange': 'New 유머',
  'food': '음식',
  'music': '음악',
  'bl1': '1차BL',
  'bl2': '2차BL',
  'community': '커뮤',
  'cosplay': '코스프레',
  'ride': '탈것',
  'shtpan': '특촬',
  'ts': 'TS',
  'gundam': '건담',
  'gurren': '그렌라간',
  'thproject': '동방프로젝트',
  'reborn': '리본',
  'vocaloid': '보컬로이드',
  'bleach': '블리치',
  'bigb': '빅뱅',
  'inazuma': '썬더 일레븐',
  'gyakuten': '역전재판',
  'yugioh': '유희왕',
  'gintama': '은혼',
  'johnnys': '쟈니즈',
  'jojo': '죠죠',
  'oofuri': '크게휘두르며',
  'tenipri': '테니프리',
  'mob': '포켓몬스터'
}
var thread_type= ['즐겨찾기', '내 스레', '코멘트'];

$('#gnav a:not(#manage,#db_manage_btn)').click(function(e){
  e.preventDefault();
  $(this).tab('show');
	imdae_yingyeo.popup(event.target.href.substr(event.target.href.indexOf('#') + 1));
})

imdae_yingyeo.popup= function(table){
  var table_arr= [];
  var type_arr= [];
  imdae_yingyeo.indexedDB({'action': 'getAll', 'table': table}, function(response){
    setList(response.result);
  });
  if($('#filter_title').children().size() > 0) $('#filter_title button').trigger('click');
  function setList(data){
    if($('.tab-pane.active .list-group').children().size() > 0) $('.tab-pane.active .list-group').children().remove();
    if(data.length < 1){
      var $thread= $('<div>').addClass('list-group-item').append($('<h4>').addClass('list-group-item-heading').text('누울 자리 살피는 중 ㅇㅅㅇ'));
      $('#'+table+' .list-group').append($thread);
    } else {
      for(idx in data){
        var item= data[idx];
        var last_update= new Date(item.last_update);
        if(typeof item.type == 'undefined') item.type= 0;
        var $item= $('<a>')
        .attr('href', 'http://bbs.daepiso.com/MBXE/Article.jsp?table='+item.table_id+'&articleIndex='+item.articleIndex+'&page=1')
        .addClass('list-group-item')
        .attr({'data-table': item.table_id, 'data-type': item.type})
        .append($('<h4>').addClass('list-group-item-heading').text(item.title));
        var $table_label= $('<span>').addClass('label label-info').text(imdae_yingyeo.bbs[item.table_id]);
        if(table_arr.indexOf(item.table_id) < 0) table_arr.push(item.table_id);
        var $type_label= $('<span>').addClass('label label-default').text(thread_type[item.type]);
        if(type_arr.indexOf(item.type) < 0) type_arr.push(item.type);
        switch(table){
          case 'my_threads':
            $item.append($('<p>').addClass('list-group-item-text').append($table_label, $type_label));
            if(item.last_update > item.checked) $item.prepend($('<span>').addClass('badge').text('N'));
            break;
          case 'fav_rethreads':
            $item.attr('href', $item.attr('href')+'#commentItem_'+item.rethreadIndex);
            var thumb_img= '';
            if(/<img[^>]+>/i.test(item.content)){
              thumb_img= item.content.match(/<img[^>]+>/)[0];
              item.content= item.content.replace(thumb_img, '');
							var img_src= thumb_img.match(/src="(\/\/[^"]+)"/);
							if(img_src != null) thumb_img= thumb_img.replace(img_src[1], 'https:'+img_src[1]);
            }
            var content= (item.content.length > 50) ? item.content.substr(0, 50) + '...' : item.content;
            var $content= $('<blockquote>').addClass('list-group-item-text').text(content);
            if(thumb_img.length > 0) $content.prepend($(thumb_img));
            $item.prepend($content);
            $item.children('.list-group-item-heading').prepend($table_label);
            break;
        }
        $item.append($('<p>').addClass('list-group-item-text').text(last_update.toLocaleDateString() + ' ' + last_update.toLocaleTimeString()));
        $('#'+table+' .list-group').append($item);
      }
      $('.list-group').on('click', 'a.list-group-item:not(.delete)', function(event){
        event.stopImmediatePropagation();
        chrome.tabs.create({url: event.currentTarget.href});
        return false;
      });
      // if(table == 'fav_rethreads') type_arr= null;
      setSidebar();
    }
  }
  function setSidebar(){
    if($('#sidebar .order-by-table, #sidebar .order-by-type').children().size() > 0) $('#sidebar .order-by-table, #sidebar .order-by-type').children().remove();
    for(idx in table_arr){
      var $link= $('<a>').attr('href', '#' + table_arr[idx]).text(imdae_yingyeo.bbs[table_arr[idx]]);
      $('#sidebar .order-by-table').append($link);
    }
    if(type_arr !== null){
      for(idx in type_arr){
        $link= $('<a>').attr('href', '#'+ type_arr[idx]).text(thread_type[type_arr[idx]]);
       $('#sidebar .order-by-type').append($link);
      }
    }
    $('.order-by-table, .order-by-type').on('click', 'a', function(event){
      var filter= event.delegateTarget.className.substr(9);
      var href= event.target.href;
      $('.tab-pane.active .list-group-item:hidden').show();
      set_filter_title(event.target.text);
      $('.tab-pane.active .list-group-item[data-'+filter+'!='+ href.substr(href.indexOf('#') + 1) +']').hide();
      return false;
    });
    $('#search').on('keyup', function(event){
      var keyword= $('#search').val();
      $('.tab-pane.active .list-group-item:hidden').show();
      $('.tab-pane.active .list-group-item h4:not(:contains('+keyword+'))').each(function(){
        $(this).parents('.list-group-item').hide();
      });
      if(keyword.length > 0){
        set_filter_title(keyword, '제목');
      } else {
        $('#filter_title').children().remove();
      }
      return false;
    });
  }
  function set_filter_title(key, index){
    if($('#filter_title').children().size() > 0) $('#filter_title').children().remove();
    var title= (typeof index != 'undefined') ? index+': '+key : key;
    var $title= $('<h2>').text(title);
    var $reset= $('<button>').addClass('btn btn-link').attr('type', 'button').append($('<i>').addClass('times-circle-o'));
    $('#filter_title').hide().append($title, $reset).slideDown('fast');
    $('#filter_title').on('click', 'button', function(){
      $('.tab-pane.active .list-group-item:hidden').show();
      $('#filter_title').children().remove();
    });
  }
}

/*
 * thread/rethread delete on popup page
 */
$('#manage').on('click', function(event){
  var $items= $('.tab-pane.active .list-group-item');
  $items.each(function(){
    var $replaceE= $(this).is('a') ? $('<div>') : $('<a>');
    for(idx in this.attributes){
      if(typeof this.attributes[idx].nodeName != 'undefined') $replaceE.attr(this.attributes[idx].nodeName, this.attributes[idx].nodeValue);
    }
    if($replaceE.is('a')){
      $(this).find('a').remove();
    } else {
      $replaceE.append($('<a>').attr({'href': '#delete', 'title': '자리 빼기'}).addClass('delete').html('&times;'));
    }
    $replaceE.append($(this).children());
    $(this).replaceWith($replaceE);
  });
});
$('.list-group').on('click', 'a.delete', function(event){
  var $target_item= $(this).parents('.list-group-item');
  var target= $target_item.attr('href');
  var request= {'action': 'delete'};
  if(target.indexOf('#commentItem_') > -1){
    request.table= 'fav_rethreads';
    request.key= target.substr(target.indexOf('#commentItem_') + '#commentItem_'.length) * 1;
  } else {
    request.table= 'my_threads';
    request.key= target.match(/articleIndex=([0-9]+)/)[1] * 1;
  }
  imdae_yingyeo.indexedDB(request, function(response){
    if(response.result) $target_item.slideUp('fast', function(){$(this).remove();});
  });
});

/*
 * db export and import
 */
$('#db_export').on('click', function(event){
	imdae_yingyeo.indexedDB({'action': 'export'}, function(response){return response.result});
});
$('#db_file').on('change', function(){
	var reader= new FileReader();
	reader.onload= function(event){
		imdae_yingyeo.indexedDB({
			'action': 'import', 
			'data': JSON.parse(reader.result)
		}, function(response){
			if(response.result){
				imdae_yingyeo.popup('my_threads');
				$('.modal-header button').trigger('click');
			}
		});
	}
	reader.readAsText(this.files[0]);
});
imdae_yingyeo.popup('my_threads');