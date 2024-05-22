// https://www.w3.org/TR/compositing-1/#advancedcompositing

import type { ColorBlendMethod, CompositeMethod, RGBAPixel } from "./mod.ts";
import { rgb, weight, weightSum } from "./util.ts";

// deno-lint-ignore no-namespace
export namespace PorterDuffArguments {
    export const Above: unique symbol = Symbol();
    export const Below: unique symbol = Symbol();
    export const AboveComplement: unique symbol = Symbol();
    export const BelowComplement: unique symbol = Symbol();
}

export type PorterDuffArgument = number | (typeof PorterDuffArguments)[keyof typeof PorterDuffArguments];

function getPorterDuffCoefficient(a: PorterDuffArgument, below: RGBAPixel, above: RGBAPixel): number {
    if (typeof a === "number") return a;
    switch (a) {
        case PorterDuffArguments.Above: return above[3];
        case PorterDuffArguments.Below: return below[3];
        case PorterDuffArguments.AboveComplement: return 1 - above[3];
        case PorterDuffArguments.BelowComplement: return 1 - below[3];
    }
}

export function porterDuff(fa: PorterDuffArgument, fb: PorterDuffArgument): CompositeMethod {
    return blend => (below, above) => {
        const _fa = getPorterDuffCoefficient(fa, below, above);
        const _fb = getPorterDuffCoefficient(fb, below, above);
        return rawPorterDuff(_fa, _fb, blend, below, above);
    };
}

export function rawPorterDuff(fa: number, fb: number, blend: ColorBlendMethod, below: RGBAPixel, above: RGBAPixel): RGBAPixel {
    const aa = above[3];
    const ab = below[3];
    const ca = rgb(above);
    const cb = rgb(below);

    const ao = aa * fa + ab * fb;
    const cm = weightSum(1 - ab, ca, ab, blend(cb, ca));
    const co = weightSum(aa * fa, cm, ab * fb, cb);
    if (ao === 0) {
        return [0, 0, 0, 0];
    }
    return [...weight(1 / ao, co), ao];
}

export const clear: CompositeMethod = () => () => {
    return [0, 0, 0, 0];
};
export const copy: CompositeMethod = () => (_, above) => {
    return above;
};
export const destination: CompositeMethod = () => (below) => {
    return below;
};
export const sourceOver: CompositeMethod = porterDuff(1, PorterDuffArguments.AboveComplement);
export const destinationOver: CompositeMethod = porterDuff(PorterDuffArguments.BelowComplement, 1);
export const sourceIn: CompositeMethod = porterDuff(PorterDuffArguments.Below, 0);
export const destinationIn: CompositeMethod = porterDuff(0, PorterDuffArguments.Above);
export const sourceOut: CompositeMethod = porterDuff(PorterDuffArguments.BelowComplement, 0);
export const destinationOut: CompositeMethod = porterDuff(0, PorterDuffArguments.AboveComplement);
export const sourceAtop: CompositeMethod = porterDuff(PorterDuffArguments.Below, PorterDuffArguments.AboveComplement);
export const destinationAtop: CompositeMethod = porterDuff(PorterDuffArguments.BelowComplement, PorterDuffArguments.Above);
export const xor: CompositeMethod = porterDuff(PorterDuffArguments.BelowComplement, PorterDuffArguments.AboveComplement);
export const lighter: CompositeMethod = porterDuff(1, 1);