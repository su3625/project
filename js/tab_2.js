$().ready(function(){
    //sub5의 탭
    $(".tab p").eq(0).click(function(){
        $(".tab_list>li").hide();     //초기화
        $(".tab_01").show();
        $(".tab p").css({"background":"#ddd","color":"#333"});    //탭버튼, 글자 색상초기화
        $(this).css({"background":"#333","color":"#fff"});    
    });
    $(".tab p").eq(1).click(function(){
        $(".tab_list>li").hide();     //초기화
        $(".tab_02").show();
        $(".tab p").css({"background":"#ddd","color":"#333"});    //탭버튼, 글자 색상초기화
        $(this).css({"background":"#333","color":"#fff"});    
    });
    $(".tab p").eq(2).click(function(){
        $(".tab_list>li").hide();     //초기화
        $(".tab_03").show();
        $(".tab p").css({"background":"#ddd","color":"#333"});    //탭버튼, 글자 색상초기화
        $(this).css({"background":"#333","color":"#fff"});    
    });
    $(".tab p").eq(3).click(function(){
        $(".tab_list>li").hide();     //초기화
        $(".tab_04").show();
        $(".tab p").css({"background":"#ddd","color":"#333"});    //탭버튼, 글자 색상초기화
        $(this).css({"background":"#333","color":"#fff"});    
    });


});