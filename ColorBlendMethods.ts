// https://www.w3.org/TR/compositing-1/#blending

import type { ColorBlendMethod, RGBPixel } from "./mod.ts";
import * as ChannelBlendMethods from "./ChannelBlendMethods.ts";
import { blendCh, mapCh } from "./util.ts";

function clipColor(c: RGBPixel): RGBPixel {
    const l = lum(c);
    const n = Math.min(c[0], c[1], c[2]);
    const x = Math.max(c[0], c[1], c[2]);
    if (n < 0) {
        c = mapCh(c => l + (((c - l) * l) / (l - n)))(c);
    }
    if (x > 1) {
        c = mapCh(c => l + (((c - l) * (1 - l)) / (x - l)))(c);
    }
    return c;
}

function lum(c: RGBPixel): number {
    return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
}

function setLum(c: RGBPixel, l: number): RGBPixel {
    const d = l - lum(c);
    return clipColor(mapCh(c => c + d)(c));
}

function sat(c: RGBPixel): number {
    return Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
}

function setSat(c: RGBPixel, s: number): RGBPixel {
    c = [...c];
    const [min, mid, max] = c.map((v, i) => [v, i]).sort(([l], [r]) => l - r).map(([_, i]) => i);
    if (c[max] > c[min]) {
        c[mid] = (c[mid] - c[min]) * s / (c[max] - c[min]);
        c[max] = s;
    } else {
        c[mid] = c[max] = 0;
    }
    c[min] = 0;
    return c;
}

export const normal: ColorBlendMethod = blendCh(ChannelBlendMethods.normal);
export const multiply: ColorBlendMethod = blendCh(ChannelBlendMethods.multiply);
export const screen: ColorBlendMethod = blendCh(ChannelBlendMethods.screen);
export const overlay: ColorBlendMethod = blendCh(ChannelBlendMethods.overlay);
export const darken: ColorBlendMethod = blendCh(ChannelBlendMethods.darken);
export const lighten: ColorBlendMethod = blendCh(ChannelBlendMethods.lighten);
export const colorDodge: ColorBlendMethod = blendCh(ChannelBlendMethods.colorDodge);
export const colorBurn: ColorBlendMethod = blendCh(ChannelBlendMethods.colorBurn);
export const hardLight: ColorBlendMethod = blendCh(ChannelBlendMethods.hardLight);
export const softLight: ColorBlendMethod = blendCh(ChannelBlendMethods.softLight);
export const difference: ColorBlendMethod = blendCh(ChannelBlendMethods.difference);
export const exclusion: ColorBlendMethod = blendCh(ChannelBlendMethods.exclusion);

export const hue: ColorBlendMethod = (b, a) => {
    return setLum(setSat(a, sat(b)), lum(b));
};

export const saturation: ColorBlendMethod = (b, a) => {
    return setLum(setSat(b, sat(a)), lum(b));
};

export const color: ColorBlendMethod = (b, a) => {
    return setLum(a, lum(b));
};

export const luminosity: ColorBlendMethod = (b, a) => {
    return setLum(b, lum(a));
};