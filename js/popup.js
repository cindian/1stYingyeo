imdae_yingyeo.bbs= {
  'notice': '이용안내',
  'admin': '관리자 문의',
  'defect': '불량품 전시',
  'sales': '영업',
  'qna': '질의응답',
  'link': '링크공유',
  'dmz_new': 'DMZ',
  'free': '자유게시판',
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

$('#gnav a:not(#manage)').click(function(e){
  e.preventDefault()
  $(this).tab('show')
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
            }
            console.log(item.content);
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
      $('.list-group').on('click', 'a.list-group-item', function(event){
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
      $('.tab-pane.active .list-group a').show();
      set_filter_title(event.target.text);
      $('.tab-pane.active .list-group a[data-'+filter+'!='+ href.substr(href.indexOf('#') + 1) +']').hide();
      return false;
    });
    $('#search').on('keyup', function(event){
      var keyword= $('#search').val();
      $('.tab-pane.active .list-group a').show();
      $('.tab-pane.active .list-group a h4:not(:contains('+keyword+'))').each(function(){
        $(this).parents('a').hide();
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
      $('.tab-pane.active .list-group a').show();
      $('#filter_title').children().remove();
    });
  }
}

$('.tab-pane.active .list-group-item').on('click', 'a.delete', function(event){
  console.log(event);
  return false;
});
$('#manage').on('click', function(){
  var $target_items= $('.tab-pane.active a.list-group-item');
  if($target_items.eq(0).hasClass('disabled')){
    $target_items.find('a.delete').remove();
    $target_items.removeClass('disabled');
  } else {
    var $delete_btn= $('<a>').addClass('delete').attr({'title': '자리 빼기', 'href': '#delete'}).html('&times;');
    $target_items.before($delete_btn);
    $target_items.addClass('disabled');
  }
  return false;
});

imdae_yingyeo.popup('my_threads');