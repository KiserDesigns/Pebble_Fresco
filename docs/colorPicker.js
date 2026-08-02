// Simple example, see optional options for more configuration.
const pickr = Pickr.create({
    el: '.main-color-picker',
    theme: 'monolith',

    default: '#000000',

    swatches: [
        'rgba(0,   0,   0,   1)',
        'rgba(85,  85,  85,  1)',
        'rgba(170, 170, 170, 1)',
        'rgba(255, 255, 255, 1)',
        'rgba(170, 0,   85,  1)',
        'rgba(85,  170, 0,   1)',
        'rgba(0,   85,  170, 1)'
    ],

    defaultRepresentation: 'HEX',

    components: {

        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
            hex: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            cancel: true,
            save: false
        }
    }
});


pickr.on('cancel', (color, source, instance) => {
    //let quant = quantizeColor(rgbaToHex(color.toRGBA().toString(0)));
    //background_color = quant;
    pickr.hide();
}).on('change', (color, source, instance) => {
    let quant = quantizeColor(rgbaToHex(color.toRGBA().toString(0)));
    background_color = quant;
    drawLayers();
}).on('hide', instance => {
    console.log('Event: "hide"', instance);
    pickr.setColor(background_color);
});


function rgbaToHex(rgba) {
  const cleanRgba = rgba.replace(/^(rgba|rgb)\(|\)$/g, '').trim();
  const separator = cleanRgba.includes(',') ? ',' : ' ';
  const parts = cleanRgba.split(separator).map(val => parseFloat(val.trim()));
  
  const [r, g, b, a] = parts;
  const toHex = (n) => (Number.isInteger(n) ? n : Math.round(n * 255)).toString(16).padStart(2, '0');

  console.log(a);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${a<0.3?'00':'FF'}`;
}

if(false){

const pickr1 = Pickr.create({
    el: '.bg-color-picker',
    theme: 'monolith',

    default: '#000000',

    swatches: [
        'rgba(0,   0,   0,   1)',
        'rgba(255, 255, 255, 1)',
        'rgba(255, 170, 0,   1)',
        'rgba(170, 255, 0,   1)',
        'rgba(0,   170, 255, 1)',
        'rgba(255, 0,   170, 1)',
        'rgba(0,   0,   0,   0)'
    ],

    defaultRepresentation: 'HEX',

    components: {

        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
            hex: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: true,
            save: true
        }
    }
});

const pickr2 = Pickr.create({
    el: '.fg-color-picker',
    theme: 'monolith',

    default: '#000000',

    swatches: [
        'rgba(0,   0,   0,   1)',
        'rgba(255, 255, 255, 1)',
        'rgba(255, 170, 0,   1)',
        'rgba(170, 255, 0,   1)',
        'rgba(0,   170, 255, 1)',
        'rgba(255, 0,   170, 1)',
        'rgba(0,   0,   0,   0)'
    ],

    defaultRepresentation: 'HEX',

    components: {

        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
            hex: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: true,
            save: true
        }
    }
});

}
