// https://www.w3.org/TR/compositing-1/#blending

import type { ChannelBlendMethod } from "./mod.ts";

export const normal: ChannelBlendMethod = (_, above) => above;
export const multiply: ChannelBlendMethod = (b, a) => b * a;
export const screen: ChannelBlendMethod = (b, a) => b + a - b * a;
export const overlay: ChannelBlendMethod = (b, a) => hardLight(a, b);
export const darken: ChannelBlendMethod = (b, a) => Math.min(b, a);
export const lighten: ChannelBlendMethod = (b, a) => Math.max(b, a);

export const colorDodge: ChannelBlendMethod = (b, a) => {
    if (b === 0) {
        return 0;
    }
    if (a === 1) {
        return 1;
    }
    return Math.min(1, b / (1 - a));
};

export const colorBurn: ChannelBlendMethod = (b, a) => {
    if (b === 1) {
        return 1;
    }
    if (a === 0) {
        return 0;
    }
    return 1 - Math.min(1, (1 - b) / a);
};

export const hardLight: ChannelBlendMethod = (b, a) => {
    if (a <= 0.5) {
        return multiply(b, 2 * a);
    } else {
        return screen(b, 2 * a - 1);
    }
};

export const softLight: ChannelBlendMethod = (b, a) => {
    if (a <= 0.5) {
        return b - (1 - 2 * a) * b * (1 - b);
    } else {
        const d = b <= 0.25
            ? ((16 * b - 12) * b + 4) * b
            : Math.sqrt(b);

        return b + (2 * a - 1) * (d - b);
    }
};

export const difference: ChannelBlendMethod = (b, a) => Math.abs(b - a);
export const exclusion: ChannelBlendMethod = (b, a) => b + a - 2 * b * a;