class Layer {
  constructor(){
    this.name = "New Layer";
    this.type = "rect"; //text, image, rect, analog
    this.x = 20;
    this.y = 10;
    this.w = 80;
    this.h = 50;
    this.layer_settings = {};
    this.content_settings = {};
    this.radius = 10;
    this.dynamic = {};
    this.fg_color = "#00AAAA";
    this.bg_color = "#550000";
  }
  setPos(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  getPos(){
    return {x:this.x, y:this.y, w: his.w, h:this.h};
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
    return radius;
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
    if (this.type == "rect" || this.type == "text"){
      if (this.bg_color[7] != 0 && !(this.layer_settings["dither"])){
        //if the background color is not clear, draw a background
        ctx.fillStyle = this.bg_color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, this.radius);
        ctx.fill();
      }
      if (this.layer_settings["dither"]){
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
        path.roundRect(0, 0, this.w, this.h, this.radius);

        let w = this.w;
        let h = this.h;
        for (let x = 0; x<w; x++){
          for(let y = 0; y<h; y++){
            if (ctx.isPointInPath(path, x, y)){
              var stroke_color;
              if (this.layer_settings["dither"] == "mix"){
                if ((x+y)%2){
                  stroke_color = this.fg_color;
                } else {
                  stroke_color = this.bg_color;
                }
                if (stroke_color[7] != 0){
                  ctx.fillStyle = stroke_color;
                  ctx.fillRect(this.x+x,this.y+y,1,1);
                }
              } else {
                var threshold = 0;
                if (this.layer_settings["dither"] == "lr"){
                  threshold = (x * 64) / (w-1); //it's Left/Right
                } else {
                  threshold = (y * 64) / (h-1); //it's Up/Down
                }
                let bayer = bayer8x8[x%8][y%8];
                if (threshold > bayer){
                  stroke_color = this.fg_color;
                } else {
                  stroke_color = this.bg_color;
                }
                if (stroke_color != 0){
                  ctx.fillStyle = stroke_color;
                  ctx.fillRect(this.x+x,this.y+y,1,1);
                }
              }
            }
          }
        }
      }
      if (this.layer_settings["outline"]){
        //if the DRAW_OUTLINE bit is set, draw an outline in the ForegroundColor
        ctx.strokeStyle = this.fg_color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, this.radius);
        ctx.stroke();
      }
      /**
      if (layer->Type == TYPE_TEXT){
        graphics_context_set_text_color(ctx, layer->ForegroundColor);
        static char text[100];
        static char text2[100];
        //add date/time where specified
        struct tm *tick_time = localtime(&time);
        formattimewords(text2, sizeof(text2), layer->Content, time);
        strftime(text, sizeof(text), text2, tick_time);
        //draw it
        graphics_draw_text(ctx, text, font(layer->FontSettings), layer->Rect, overflow(layer->FontSettings), alignment(layer->FontSettings), (GTextAttributes *)0);
      }
      **/
      if (this.layer_settings["inverter"]){
        ctx.fillStyle = "#FFFFFF";
        ctx.globalCompositeOperation = "difference";
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, this.radius);
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