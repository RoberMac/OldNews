angular.module('ShinyaNews.selectNewsItemServices', [])
.service('sySelectNewsItem', function(){

    // 當前新聞項
    this.id = -1,
    // 選擇新聞項
    this.go = function (step){
        var newsItemList = document.getElementsByClassName('newsBox__news__item__title'),
            len          = newsItemList.length;

        if (step === -1 && this.id > 0 && this.id < len){
            this.id--
            newsItemList[this.id].focus()
        } else if (step === 1 && this.id >= -1 && this.id < len - 1){
            this.id++
            newsItemList[this.id].focus()
        }
    },
    // 重置新聞項
    this.reset = function (){
        this.id = -1
    }
})