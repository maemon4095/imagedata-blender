export * as ChannelBlendMethods from "./ChannelBlendMethods.ts";
export * as ColorBlendMethods from "./ColorBlendMethods.ts";
export * as CompositeMethods from "./CompositeMethods.ts";
export * as utils from "./util.ts";

/** a RGBA pixel. Each channel value is in 0.0 to 1.0 */
export type RGBAPixel = [number, number, number, number];
/** a RGB pixel. Each channel value is in 0.0 to 1.0 */
export type RGBPixel = [number, number, number];
export type BlendMethod = (below: RGBAPixel, above: RGBAPixel) => RGBAPixel;
export type ColorBlendMethod = (below: RGBPixel, above: RGBPixel) => RGBPixel;
export type CompositeMethod = (blend: ColorBlendMethod) => BlendMethod;
export type ChannelBlendMethod = (below: number, above: number) => number;

export class Blender {
    #width: number;
    #height: number;
    #buffer: Uint8ClampedArray;
    #tmpBuffer: Uint8ClampedArray;

    constructor(width: number, height: number);
    constructor(base: ImageData);
    constructor(baseOrWidth: ImageData | number, height?: number) {
        if (typeof baseOrWidth === "number") {
            this.#width = baseOrWidth;
            this.#height = height!;
            this.#buffer = new Uint8ClampedArray(this.#width * this.#height * 4);
            this.#tmpBuffer = new Uint8ClampedArray(this.#width * this.#height * 4);
        } else {
            this.#width = baseOrWidth.width;
            this.#height = baseOrWidth.height;
            this.#buffer = new Uint8ClampedArray(baseOrWidth.data);
            this.#tmpBuffer = new Uint8ClampedArray(baseOrWidth.data.length);
        }
    }

    get width(): number {
        return this.#width;
    }

    get height(): number {
        return this.#height;
    }

    #swapBuffer() {
        const tmp = this.#buffer;
        this.#buffer = this.#tmpBuffer;
        this.#tmpBuffer = tmp;
    }

    blend(image: ImageData, dx: number, dy: number, method: BlendMethod): void {
        const aboveOffsetX = -Math.min(dx, 0);
        const aboveOffsetY = -Math.min(dy, 0);
        const belowOffsetX = Math.max(dx, 0);
        const belowOffsetY = Math.max(dy, 0);
        const xMax = Math.min(image.width - aboveOffsetX, this.#width - belowOffsetX);
        const yMax = Math.min(image.height - aboveOffsetY, this.#height - belowOffsetY);
        this.#tmpBuffer.set(this.#buffer);
        for (let y = 0; y < yMax; ++y) {
            for (let x = 0; x < xMax; ++x) {
                const aboveOffset = ((y + aboveOffsetY) * image.width + (x + aboveOffsetX)) * 4;
                const belowOffset = ((y + belowOffsetY) * this.#width + (x + belowOffsetX)) * 4;
                const below = readPixel(this.#buffer, belowOffset);
                const above = readPixel(image.data, aboveOffset);
                const pixel = method(below, above);
                writePixel(this.#tmpBuffer, belowOffset, pixel);
            }
        }
        this.#swapBuffer();
    }

    /** create ImageData refers the internal buffer. You **should not** use the blender after calling this function. */
    intoImageData(): ImageData {
        return new ImageData(this.#buffer, this.#width, this.#height);
    }

    /** create ImageData with copied buffer. */
    createImageData(): ImageData {
        return new ImageData(new Uint8ClampedArray(this.#buffer), this.#width, this.#height);
    }
}

function readPixel(buffer: Uint8ClampedArray, offset: number): RGBAPixel {
    return [
        buffer[offset + 0] / 255,
        buffer[offset + 1] / 255,
        buffer[offset + 2] / 255,
        buffer[offset + 3] / 255
    ];
}

function writePixel(buffer: Uint8ClampedArray, offset: number, pixel: RGBAPixel) {
    buffer[offset + 0] = pixel[0] * 255;
    buffer[offset + 1] = pixel[1] * 255;
    buffer[offset + 2] = pixel[2] * 255;
    buffer[offset + 3] = pixel[3] * 255;
}