export interface IShape {
    height: number;
    width: number;
    fields: { x: number, y: number }[]
}

function rotateShape(shape: IShape, rotation: number): IShape {
    let newShape = shape;
    if (rotation !== 90) {
        newShape = rotateShape(shape, rotation === 180 ? 90 : 180);
    }

    let fields = newShape.fields.map(field => ({
        x: newShape.height - field.y - 1,
        y: field.x,
    }));

    return {
        width: newShape.height,
        height: newShape.width,
        fields: fields,
    };
}

function mirrorShape(shape: IShape, horizontal: boolean): IShape {
    return {
        height: shape.height,
        width: shape.width,
        fields: shape.fields.map(field => ({
            x: !horizontal ? shape.width - field.x : field.x,
            y: !horizontal ? field.y : shape.height - field.y,
        })),
    };
}

function transformShape(shape: IShape, rotations: number, mirror: 'no' | 'horizontal' | 'vertical' | 'all'): IShape[] {
    let mirrorResults: IShape[] = [shape];
    if (mirror === 'horizontal') {
        mirrorResults.push(mirrorShape(shape, true));
    } else if (mirror === 'vertical') {
        mirrorResults.push(mirrorShape(shape, false));
    } else if (mirror === 'all') {
        mirrorResults.push(mirrorShape(shape, true));
        mirrorResults.push(mirrorShape(shape, false));
    }
    let result: IShape[] = [];
    for (let mirrorResult of mirrorResults) {
        for (let i = 0; i < rotations; i++) {
            result.push(rotateShape(mirrorResult, (90 * i)));
        }
    }
    return result;
}

export function getShapes(): IShape[] {
    return [
        ...transformShape({ height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }] }, 2, 'horizontal'),
        ...transformShape({ height: 3, width: 2, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }] }, 4, 'horizontal'),
        ...transformShape({ height: 3, width: 3, fields: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, 2, 'horizontal'),
    ];
}
