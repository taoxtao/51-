const formatTime = function(time){
     return time.replace('T',' ');
}
const textIndex = function(text,num){
    if(num==0){
    text = text.replace("　　","");
    return text.replace(/<[^>]+>/g,"");
    }
}
var test = function(){
  return '1111111111';
}

const tag = function(id,tags){
    for(var i=0;i<tags.length;i++){
        if(id==tags[i].id){
            return tags[i].name;
        }
    }
}

module.exports = {
     formatTime:formatTime,
     test:test,
     textIndex:textIndex,
     tagName:tag
}