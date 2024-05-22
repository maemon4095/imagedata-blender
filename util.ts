import type { ChannelBlendMethod, ColorBlendMethod, RGBAPixel, RGBPixel } from "./mod.ts";

export function rgb(pixel: RGBAPixel): RGBPixel {
    return [pixel[0], pixel[1], pixel[2]];
}

export function weight(weight: number, pixel: RGBPixel): RGBPixel {
    return [
        weight * pixel[0],
        weight * pixel[1],
        weight * pixel[2],
    ];
}

export function weightSum(weightL: number, l: RGBPixel, weightR: number, r: RGBPixel): RGBPixel {
    return [
        l[0] * weightL + r[0] * weightR,
        l[1] * weightL + r[1] * weightR,
        l[2] * weightL + r[2] * weightR,
    ];
}

export function blendCh(ch: ChannelBlendMethod): ColorBlendMethod {
    return (below, above) => {
        return [
            ch(below[0], above[0]),
            ch(below[1], above[1]),
            ch(below[2], above[2]),
        ];
    };
}

export function mapCh(f: (c: number) => number): (pixel: RGBPixel) => RGBPixel {
    return (pixel) => [f(pixel[0]), f(pixel[1]), f(pixel[2])];
}
