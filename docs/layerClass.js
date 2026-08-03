
// https://andy0130tw.github.io/pbf-inspect/


function getFirstWord(date){
  let words = ["half", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "quarter", "twenty"];
  let min = date.getMinutes();
  let hour = date.getHours();
  
  let index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13)){
    index = min;
  } else if (min == 30) {
    index = 0;
  } else if (min == 15 || min == 45) {
    index = 14;
  } else if (min == 40 || min == 20) {
    index = 15;
  } else if (min == 50) {
    index = 10;
  } else if (min == 55) {
    index = 5;
  } else {
    index = hour % 12;
    if (index == 0) {
      index = 12;
    }
  }
  return words[index];
}

function getSecondWord(date){
  let words = ["o'", "oh", "twenty", "thirty", "fourty", "fifty", "six-", "seven-", "eight-", "nine-", "past", "till", "four-"];
  let min = date.getMinutes();
  
  let index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13) || min == 15 || min == 20 || min == 30){
    index = 10;
  } else if (min >= 1 && min <= 9) {
    index = 1;
  } else if (min == 0) {
    index = 0;
  } else if (min >= 14 && min <= 19) {
    if (min == 14) {
      index = 12;
    } else {
      index = min - 10;
    }
  } else if (min == 40 || min == 45 || min == 50 || min == 55) {
    index = 11;
  } else {
    index = Math.floor(min / 10);
  }
 return words[index];
}

function getThirdWord(date){
  let words = ["clock", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "teen", "noon", "midnight"];
  let min = date.getMinutes();
  let hour = date.getHours();
  
  let index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13) || min == 15 || min == 20 || min == 30){
    if (hour == 0) {
      index = 15;
    } else if (hour == 12) {
      index = 14;
    } else {
      index = hour % 12;
    }
  } else if (min == 0) {
    index = 0;
  } else if (min >= 14 && min <= 19) {
    index = 13;
  } else if (min == 40 || min == 45 || min == 50 || min == 55) {
    hour = hour + 1;
    if (hour == 24) {
      index = 15;
    } else if (hour == 12) {
      index = 14;
    } else {
      index = hour % 12;
    }
  } else {
    index = min % 10;
  }
  return words[index];
}



function wrapText(ctx, text, x, y, maxWidth, maxHeight, lineHeight, wordWrap = "true", align){
    const words = text.split(' ');
    let currentLine = '';
    const maxY = parseInt(maxHeight) + parseInt(y);
    let plotX;

    if (align == "left") {
        plotX = parseInt(x);
    } else if (align =="right") {
        plotX = parseInt(x) + parseInt(maxWidth);
    } else {
        plotX = parseInt(x) + Math.floor(maxWidth/2);
    }

    for (let i=0; i<words.length;i++) {
        let testLine = currentLine + words[i];
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > parseInt(maxWidth) && i>0) {
            if (wordWrap == "true"){
                if (parseInt(y) <= parseInt(maxY)) { ctx.fillText(currentLine.slice(0,-1), plotX, parseInt(y)+parseInt(lineHeight)); }
                currentLine = words[i] + ' ';
                y = parseInt(y) + parseInt(lineHeight);
            } else {
                ctx.fillText(currentLine.slice(0,-1) + '...', plotX, parseInt(y)+parseInt(lineHeight));
                return;
            }
        } else {
            currentLine = testLine + ' ';
        }
    }
    if (y <= maxY) { ctx.fillText(currentLine.slice(0,-1), plotX, parseInt(y)+parseInt(lineHeight)); }
}

class Layer {
  constructor(){
    this.name = "New Layer";
    this.type = "rect"; //text, image, rect, analog
    this.x = 20;
    this.y = 10;
    this.w = 80;
    this.h = 50;
    this.layer_settings = {"enabled":"false","outline":"true"};
    this.content_settings = {};
    this.font_settings = {"align":"left","wordWap":"false","font":"18px gotham-light"}; // font, align, and wordWrap
    this.radius = 10;
    this.dynamic = {};
    this.fg_color = "#00AAAA";
    this.bg_color = "#550000";
    this.content = "%S/59";
  }
  setFontSetting(key, value){
    this.font_settings[key] = value;
  }
  getFontSetting(key){
    return this.font_settings[key];
  }
  setContent(content){
    this.content = content;
  }
  getContent(){
    return this.content;
  }
  setPos(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  setX(x){this.x = x;}setY(y){this.y = y;}
  setW(w){this.w = w;}setH(h){this.h = h;}
  getPos(){
    return {x:this.x, y:this.y, w: this.w, h:this.h};
  }
  setName(name){
    this.name = name;
  }
  getName(){
    return this.name;
  }
  setType(type){
    this.type = type;
  }
  getType(){
    return this.type;
  }
  setFgColor(color){
    this.fg_color = color;
  }
  getFgColor(){
    return this.fg_color;
  }
  setBgColor(color){
    this.bg_color = color;
  }
  getBgColor(){
    return this.bg_color;
  }
  setRadius(radius){
    this.radius = radius;
  }
  getRadius(){
    return this.radius;
  }
  setDynamic(key, value){
    this.dynamic[key] = value;
  }
  getDynamic(key){
    return this.dynamic[key];
  }
  setContentSetting(key, value){
    this.content_settings[key] = value;
  }
  getContentSetting(key){
    return this.content_settings[key];
  }
  setLayerSetting(key, value){
    this.layer_settings[key] = value;
  }
  getLayerSetting(key){
    return this.layer_settings[key];
  }
  draw(ctx){
    let max_w = ctx.canvas.width;
    let max_h = ctx.canvas.height;
    if (this.type == "rect" || this.type == "text"){
      if (this.bg_color[7] != 0 && !(this.layer_settings["dither"]=="mix"||this.layer_settings["dither"]=="lr"||this.layer_settings["dither"]=="ud")){
        //if the background color is not clear, draw a background
        ctx.fillStyle = this.bg_color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, Math.max(0,this.radius));
        ctx.fill();
      }
      if ((this.layer_settings["dither"]=="mix"||this.layer_settings["dither"]=="lr"||this.layer_settings["dither"]=="ud")){
        const bayer8x8 = [
          [0,  32, 8,  40, 2,  34, 10, 42],
          [48, 16, 56, 24, 50, 18, 58, 26],
          [12, 44, 4,  36, 14, 46, 6, 38],
          [60, 28, 52, 20, 62, 30, 54, 22],
          [3,  35, 11, 43, 1,  33, 9,  41],
          [51, 19, 59, 27, 49, 17, 57, 25], 
          [15, 47, 7,  39, 13, 45, 5,  37],
          [63, 31, 55, 23, 61, 29, 53, 21]
        ];

        let path = new Path2D();
        var x = parseInt(this.x);
        var y = parseInt(this.y);
        var w = parseInt(this.w);
        var h = parseInt(this.h);
        var r = Math.max(0,parseInt(this.radius));
        path.roundRect(x,y,w,h,r);
        
        w = parseInt(this.w);
        h = parseInt(this.h);
        for (x = Math.max(0,this.x); Math.min(max_w,x<parseInt(this.x)+w); x++){
          for(y = Math.max(0,this.y); Math.min(max_h,y<parseInt(this.y)+h); y++){
            if (ctx.isPointInPath(path, parseInt(x)+0.5, parseInt(y)+0.5)){
              var stroke_color;
              if (this.layer_settings["dither"] == "mix"){
                if (((x-this.x)+(y-this.y))%2){
                  stroke_color = this.fg_color;
                } else {
                  stroke_color = this.bg_color;
                }
                if (stroke_color[7] != 0){
                  ctx.fillStyle = stroke_color;
                  ctx.fillRect(x,y,1,1);
                }
              } else {
                var threshold = 0;
                if (this.layer_settings["dither"] == "lr"){
                  threshold = ((x-this.x) * 64) / (w-1); //it's Left/Right
                } else if (this.layer_settings["dither"] == "ud") {
                  threshold = ((y-this.y) * 64) / (h-1); //it's Up/Down
                }
                let bayer = bayer8x8[(x-this.x)%8][(y-this.y)%8];
                if (threshold > bayer){
                  stroke_color = this.fg_color;
                } else {
                  stroke_color = this.bg_color;
                }
                if (stroke_color != 0){
                  ctx.fillStyle = stroke_color;
                  ctx.fillRect(x,y,1,1);
                }
              }
            }
          }
        }
      }
      if (this.layer_settings["outline"] == 'true'){
        //if the DRAW_OUTLINE bit is set, draw an outline in the ForegroundColor
        ctx.strokeStyle = this.fg_color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        var x = parseInt(this.x)+0.5;
        var y = parseInt(this.y)+0.5;
        var w = parseInt(this.w)-1;
        var h = parseInt(this.h)-1;
        var r = Math.max(0,parseInt(this.radius)-0.5);
        ctx.roundRect(x,y,w,h,r);
        //ctx.roundRect(this.x, this.y, this.w, this.h, this.radius);
        ctx.stroke();
      }
      if (this.type == 'text'){
        // //graphics_context_set_text_color(ctx, layer->ForegroundColor);
        // static char text[100];
        // static char text2[100];
        // //add date/time where specified
        // struct tm *tick_time = localtime(&time);
        // formattimewords(text2, sizeof(text2), layer->Content, time);
        // strftime(text, sizeof(text), text2, tick_time);
        // //draw it
        // graphics_draw_text(ctx, text, font(layer->FontSettings), layer->Rect, overflow(layer->FontSettings), alignment(layer->FontSettings), (GTextAttributes *)0);
        
        ctx.font = this.font_settings["font"];
        ctx.fillStyle = this.fg_color;
        let align = this.font_settings["align"];
        ctx.textAlign = align;
        let wordWrap = this.font_settings["wordWrap"];
        
        
        let lineHeight = parseInt(this.font_settings["font"]);
        
        ctx.textBaseline = "alphabetic";   

        let date = new Date(document.getElementById("datetime").value);
        
        let formatted = this.content;
        formatted = formatted.replaceAll('\%f',document.getElementById("battery").value);
        formatted = formatted.replaceAll('\%i',document.getElementById("heartrate").value);
        formatted = formatted.replaceAll('\%v',document.getElementById("steps").value);
        formatted = formatted.replaceAll('\%J',getFirstWord(date));
        formatted = formatted.replaceAll('\%K',getSecondWord(date));
        formatted = formatted.replaceAll('\%L',getThirdWord(date));
        formatted = formatted.replaceAll('\%q',document.getElementById("time_mode").value=="24"?"%H":"%I");
        formatted = formatted.replaceAll('\%Q',document.getElementById("time_mode").value=="24"?"%H":"%o");
        formatted = formatted.replaceAll('\%N',date.getHours());
        formatted = formatted.replaceAll('\%o',(date.getHours()+23)%12+1);
        formatted = formatted.replaceAll('\%S',(new Date).strftime("%S"));
        formatted = formatted.replaceAll('\%s',parseInt(date.strftime("%s"))+parseInt((new Date).strftime("%S")));
        //format additional words
        formatted = date.strftime(formatted);
        wrapText(ctx, formatted, this.x, this.y, this.w, this.h, lineHeight, wordWrap, align);  
    }
      
      if (this.layer_settings["inverter"] == 'true'){
        ctx.fillStyle = "#FFFFFF";
        ctx.globalCompositeOperation = "difference";
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, Math.max(0,this.radius));
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
    }
    /**
    if (layer->Type == TYPE_ANALOG){
      draw_analog(ctx, layer, localtime(&time));
    }
    if (layer->Type == TYPE_IMAGE){
      draw_image(ctx, layer);
    }
    **/
  }
}