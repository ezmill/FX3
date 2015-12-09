
 var NeonGlowShader = function(){
         this.uniforms = THREE.UniformsUtils.merge([
             {
                 "texture"  : { type: "t", value: null },
                 "origTex"  : { type: "t", value: null },
                 "alpha"  : { type: "t", value: null },
                 "mouse"  : { type: "v2", value: null },
                 "resolution"  : { type: "v2", value: null },
                 "time"  : { type: "f", value: null },
                 "r2"  : { type: "f", value: null }

             }
         ]);

         this.vertexShader = [

             "varying vec2 vUv;",
             "void main() {",
             "    vUv = uv;",
             "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
             "}"
         
         ].join("\n");
         
         this.fragmentShader = [
             
            "uniform sampler2D texture;",
            "uniform sampler2D alpha;",
            "uniform vec2 resolution;",
            "uniform vec2 mouse;",
            "uniform float r2;",
            "uniform float time;",
            "varying vec2 vUv;",
            
            "vec3 darken( vec3 s, vec3 d )",
            "{",
            "   return min(s,d);",
            "}",

            "vec3 multiply( vec3 s, vec3 d )",
            "{",
            "   return s*d;",
            "}",

            "vec3 colorBurn( vec3 s, vec3 d )",
            "{",
            "   return 1.0 - (1.0 - d) / s;",
            "}",

            "vec3 linearBurn( vec3 s, vec3 d )",
            "{",
            "   return s + d - 1.0;",
            "}",

            "vec3 darkerColor( vec3 s, vec3 d )",
            "{",
            "   return (s.x + s.y + s.z < d.x + d.y + d.z) ? s : d;",
            "}",

            "vec3 lighten( vec3 s, vec3 d )",
            "{",
            "   return max(s,d);",
            "}",

            "vec3 screen( vec3 s, vec3 d )",
            "{",
            "   return s + d - s * d;",
            "}",

            "vec3 colorDodge( vec3 s, vec3 d )",
            "{",
            "   return d / (1.0 - s);",
            "}",

            "vec3 linearDodge( vec3 s, vec3 d )",
            "{",
            "   return s + d;",
            "}",

            "vec3 lighterColor( vec3 s, vec3 d )",
            "{",
            "   return (s.x + s.y + s.z > d.x + d.y + d.z) ? s : d;",
            "}",

            "float overlay( float s, float d )",
            "{",
            "   return (d < 0.5) ? 2.0 * s * d : 1.0 - 2.0 * (1.0 - s) * (1.0 - d);",
            "}",

            "vec3 overlay( vec3 s, vec3 d )",
            "{",
            "   vec3 c;",
            "   c.x = overlay(s.x,d.x);",
            "   c.y = overlay(s.y,d.y);",
            "   c.z = overlay(s.z,d.z);",
            "   return c;",
            "}",

            "float softLight( float s, float d )",
            "{",
            "   return (s < 0.5) ? d - (1.0 - 2.0 * s) * d * (1.0 - d) ",
            "       : (d < 0.25) ? d + (2.0 * s - 1.0) * d * ((16.0 * d - 12.0) * d + 3.0) ",
            "                    : d + (2.0 * s - 1.0) * (sqrt(d) - d);",
            "}",

            "vec3 softLight( vec3 s, vec3 d )",
            "{",
            "   vec3 c;",
            "   c.x = softLight(s.x,d.x);",
            "   c.y = softLight(s.y,d.y);",
            "   c.z = softLight(s.z,d.z);",
            "   return c;",
            "}",

            "float hardLight( float s, float d )",
            "{",
            "   return (s < 0.5) ? 2.0 * s * d : 1.0 - 2.0 * (1.0 - s) * (1.0 - d);",
            "}",

            "vec3 hardLight( vec3 s, vec3 d )",
            "{",
            "   vec3 c;",
            "   c.x = hardLight(s.x,d.x);",
            "   c.y = hardLight(s.y,d.y);",
            "   c.z = hardLight(s.z,d.z);",
            "   return c;",
            "}",

            "float vividLight( float s, float d )",
            "{",
            "   return (s < 0.5) ? 1.0 - (1.0 - d) / (2.0 * s) : d / (2.0 * (1.0 - s));",
            "}",

            "vec3 vividLight( vec3 s, vec3 d )",
            "{",
            "   vec3 c;",
            "   c.x = vividLight(s.x,d.x);",
            "   c.y = vividLight(s.y,d.y);",
            "   c.z = vividLight(s.z,d.z);",
            "   return c;",
            "}",

            "vec3 linearLight( vec3 s, vec3 d )",
            "{",
            "   return 2.0 * s + d - 1.0;",
            "}",

            "float pinLight( float s, float d )",
            "{",
            "   return (2.0 * s - 1.0 > d) ? 2.0 * s - 1.0 : (s < 0.5 * d) ? 2.0 * s : d;",
            "}",

            "vec3 pinLight( vec3 s, vec3 d )",
            "{",
            "   vec3 c;",
            "   c.x = pinLight(s.x,d.x);",
            "   c.y = pinLight(s.y,d.y);",
            "   c.z = pinLight(s.z,d.z);",
            "   return c;",
            "}",

            "vec3 hardMix( vec3 s, vec3 d )",
            "{",
            "   return floor(s + d);",
            "}",

            "vec3 difference( vec3 s, vec3 d )",
            "{",
            "   return abs(d - s);",
            "}",

            "vec3 exclusion( vec3 s, vec3 d )",
            "{",
            "   return s + d - 2.0 * s * d;",
            "}",

            "vec3 subtract( vec3 s, vec3 d )",
            "{",
            "   return s - d;",
            "}",

            "vec3 divide( vec3 s, vec3 d )",
            "{",
            "   return s / d;",
            "}",

            "// rgb<-->hsv functions by Sam Hocevar",
            "// http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl",
            "vec3 rgb2hsv(vec3 c)",
            "{",
            "   vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
            "   vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));",
            "   vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));",
            "   ",
            "   float d = q.x - min(q.w, q.y);",
            "   float e = 1.0e-10;",
            "   return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
            "}",

            "vec3 hsv2rgb(vec3 c)",
            "{",
            "   vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
            "   vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
            "   return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
            "}",

            "vec3 hue( vec3 s, vec3 d )",
            "{",
            "   d = rgb2hsv(d);",
            "   d.x = rgb2hsv(s).x;",
            "   return hsv2rgb(d);",
            "}",

            "vec3 color( vec3 s, vec3 d )",
            "{",
            "   s = rgb2hsv(s);",
            "   s.z = rgb2hsv(d).z;",
            "   return hsv2rgb(s);",
            "}",

            "vec3 saturation( vec3 s, vec3 d )",
            "{",
            "   d = rgb2hsv(d);",
            "   d.y = rgb2hsv(s).y;",
            "   return hsv2rgb(d);",
            "}",

            "vec3 luminosity( vec3 s, vec3 d )",
            "{",
            "   float dLum = dot(d, vec3(0.3, 0.59, 0.11));",
            "   float sLum = dot(s, vec3(0.3, 0.59, 0.11));",
            "   float lum = sLum - dLum;",
            "   vec3 c = d + lum;",
            "   float minC = min(min(c.x, c.y), c.z);",
            "   float maxC = max(max(c.x, c.y), c.z);",
            "   if(minC < 0.0) return sLum + ((c - sLum) * sLum) / (sLum - minC);",
            "   else if(maxC > 1.0) return sLum + ((c - sLum) * (1.0 - sLum)) / (maxC - sLum);",
            "   else return c;",
            "}",
            "vec3 sample(const int x, const int y, in vec2 fragCoord)",
            "{",
            "    vec2 uv = fragCoord.xy / resolution.xy * resolution.xy;",
            "    uv = (uv + vec2(x, y)) / resolution.xy;",
            "    return texture2D(texture, uv).xyz;",
            "}",

            "float luminance(vec3 c)",
            "{",
            "    return dot(c, vec3(.2126, .7152, .0722));",
            "}",

            "vec3 filter(in vec2 fragCoord)",
            "{",
            "    vec3 hc =sample(-1,-1, fragCoord) *  1. + sample( 0,-1, fragCoord) *  2.",
            "             +sample( 1,-1, fragCoord) *  1. + sample(-1, 1, fragCoord) * -1.",
            "             +sample( 0, 1, fragCoord) * -2. + sample( 1, 1, fragCoord) * -1.;        ",

            "    vec3 vc =sample(-1,-1, fragCoord) *  1. + sample(-1, 0, fragCoord) *  2.",
            "             +sample(-1, 1, fragCoord) *  1. + sample( 1,-1, fragCoord) * -1.",
            "             +sample( 1, 0, fragCoord) * -2. + sample( 1, 1, fragCoord) * -1.;",

            "    return sample(0, 0, fragCoord) * pow(luminance(vc*vc + hc*hc), .6);",
            "}",
            "float lookup(vec2 p, float dx, float dy)",
            "{",
            "float d = sin(time * 5.0)*0.5 + 1.5; // kernel offset",
            "    vec2 uv = (p.xy + vec2(dx * d, dy * d)) / resolution.xy;",
            "    vec4 c = texture2D(texture, uv.xy);",
            "    ",
            "    // return as luma",
            "    return 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;",
            "}",
            "void main()",
            "{",
            "float d = sin(time * 5.0)*0.5 + 1.5; // kernel offset",

            // "    float u = gl_FragCoord.x / resolution.x;",
            // "    float m = mouse.x / resolution.x;",
            // "    ",
            // "    float l = smoothstep(0., 1. / resolution.y, abs(m - u));",
            // "    ",
            // "    vec2 fc = gl_FragCoord.xy;",
            // "    // fc.y = resolution.y - fragCoord.y;",
            // "    ",
            // "    vec3 cf = filter(fc);",
            // "    vec3 cl = sample(0, 0, fc);",
            // "    vec3 SOBEL = (u < m ? cl : cf) * l;",
// 
            "vec2 p = gl_FragCoord.xy;",
    
            "// simple sobel edge detection",
            "float gx = 0.0;",
            "gx += -1.0 * lookup(p, -1.0, -1.0);",
            "gx += -2.0 * lookup(p, -1.0,  0.0);",
            "gx += -1.0 * lookup(p, -1.0,  1.0);",
            "gx +=  1.0 * lookup(p,  1.0, -1.0);",
            "gx +=  2.0 * lookup(p,  1.0,  0.0);",
            "gx +=  1.0 * lookup(p,  1.0,  1.0);",
            
            "float gy = 0.0;",
            "gy += -1.0 * lookup(p, -1.0, -1.0);",
            "gy += -2.0 * lookup(p,  0.0, -1.0);",
            "gy += -1.0 * lookup(p,  1.0, -1.0);",
            "gy +=  1.0 * lookup(p, -1.0,  1.0);",
            "gy +=  2.0 * lookup(p,  0.0,  1.0);",
            "gy +=  1.0 * lookup(p,  1.0,  1.0);",
            
            "// hack: use g^2 to conceal noise in the video",
            "float g = gx*gx + gy*gy;",
            "float g2 = g * (sin(time) / 2.0 + 0.5);",
            
            "vec4 SOBEL = texture2D(texture, p / resolution.xy);",
            "SOBEL += vec4(g*(235.0/255.0), g*(64.0/255.0), g*(10.0/255.0), 1.0);",
// 
            "vec4 center = texture2D(texture, vUv);",
            "float exponent = 1.0;",
            "vec4 color = vec4(0.0);",
            "float total = 0.0;",
            "for (float x = -4.0; x <= 4.0; x += 2.0) {",
            "    for (float y = -4.0; y <= 4.0; y += 2.0) {",
            "        vec4 sample = texture2D(texture, vUv + vec2(x, y) / resolution);",
            "        float weight = 1.0 - abs(dot(sample.rgb - center.rgb, vec3(0.25)));",
            "        weight = pow(weight, exponent);",
            "        color += sample * weight;",
            "        total += weight;",
            "    }",
            "}",
            "vec4 BLUR = color / total;",
            "vec4 ORIGINAL = texture2D(texture, vUv);",

            // "vec3 FINAL = overlay(BLUR.rgb, SOBEL.rgb);",
            // "FINAL = difference( FINAL, ORIGINAL.rgb);",

            "vec3 FINAL = difference(ORIGINAL.rgb, SOBEL.rgb);",
            "FINAL = overlay( FINAL, BLUR.rgb);",
            "FINAL = saturation(FINAL, SOBEL.rgb);",
            "FINAL = overlay( FINAL, ORIGINAL.rgb);",


            "    vec3 col = texture2D(texture, vUv).rgb;",
            "    vec4 alpha = texture2D(alpha, vUv);",
            "    if(dot(alpha.rgb, vec3(1.0))/3.0 > 0.1){",
            "       col = mix( col, FINAL, dot(alpha.rgb, vec3(1.0))/3.0);",
            "    }",

            "    gl_FragColor = vec4(col, 1);",
            "}"


         
         ].join("\n");
 }