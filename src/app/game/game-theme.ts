import { ThemeService } from '../services/theme.service';

export class Color {
    red: number;
    green: number;
    blue: number;
    constructor(hex: string) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            throw new Error(`Invalid hex color: ${hex}`);
        }
        this.red = parseInt(result[1], 16);
        this.green = parseInt(result[2], 16);
        this.blue = parseInt(result[3], 16);
    }

    hex(): string {
        return `#${this.red.toString(16).padStart(2, '0')}${this.green.toString(16).padStart(2, '0')}${this.blue.toString(16).padStart(2, '0')}`;
    }
}

export interface IGameTheme {
    fieldHighlightColor: Color;
    fieldMarkedColor: Color;
    fieldBaseColor: Color;
    fieldInnerBorderColor: Color;
    fieldOuterBorderColor: Color;
    markedFieldOuterBorderColor: Color;
    fieldDisabledColor: Color;
    fieldWarningColor: Color;
    sectorLineColor: Color;
    fieldLineColor: Color;
}


export class GameTheme {
    constructor(
        private themeService: ThemeService,
        debugMode: boolean = false,
    ) {
        if (debugMode) {
            (window as any).theme = this;
            (window as any).Color = Color;

            const fields: (keyof IGameTheme)[] = [
                'fieldHighlightColor',
                'fieldMarkedColor',
                'fieldBaseColor',
                'fieldInnerBorderColor',
                'fieldOuterBorderColor',
                'markedFieldOuterBorderColor',
                'fieldDisabledColor',
                'fieldWarningColor',
                'sectorLineColor',
                'fieldLineColor',
            ];




            function getHex(element: HTMLDivElement) {
                let rgb = /^rgb\(([a-f\d]+), ([a-f\d]+), ([a-f\d]+)\)$/i.exec(window.getComputedStyle(element).getPropertyValue('color'));
                if (!rgb) {
                    throw new Error(`Invalid hex color: ${window.getComputedStyle(element).getPropertyValue('color')}`);
                }
                return `#${Number(rgb[1]).toString(16).padStart(2, '0')}${Number(rgb[2]).toString(16).padStart(2, '0')}${Number(rgb[3]).toString(16).padStart(2, '0')}`;
            }

            const updateFns: (() => void)[] = [];

            for (let field of fields) {
                const fieldDiv = document.createElement('div');
                fieldDiv.style.display = 'hidden';
                fieldDiv.style.color = this.getTheme()[field].hex();
                fieldDiv.innerHTML = field;
                document.body.appendChild(fieldDiv);
                updateFns.push(() => this.getTheme()[field] = new Color(getHex(fieldDiv)));
            }
            setInterval(() => {
                for (let fn of updateFns) {
                    fn();
                }
            }, 100);


        }
    }

    lightTheme: IGameTheme = {
        fieldHighlightColor: new Color('#4094eb'),
        fieldMarkedColor: new Color('#A0A0A0'),
        fieldBaseColor: new Color('#4270d8'),
        fieldInnerBorderColor: new Color('#50A0F0'),
        fieldOuterBorderColor: new Color('#000000'),
        markedFieldOuterBorderColor: new Color('#505050'),
        fieldDisabledColor: new Color('#505050'),
        fieldWarningColor: new Color('#a95792'),
        sectorLineColor: new Color('#000000'),
        fieldLineColor: new Color('#505050'),
    }

    darkTheme: IGameTheme = {
        fieldHighlightColor: new Color('#3f68df'),
        fieldMarkedColor: new Color('#4e4c4c'),
        fieldBaseColor: new Color('#1945c3'),
        fieldInnerBorderColor: new Color('#8ea9f7'),
        fieldOuterBorderColor: new Color('#000000'),
        markedFieldOuterBorderColor: new Color('#505050'),
        fieldDisabledColor: new Color('#505050'),
        fieldWarningColor: new Color('#a95792'),
        sectorLineColor: new Color('#939393'),
        fieldLineColor: new Color('#939393'),
    }

    getTheme(): IGameTheme {
        if (this.themeService.isDarkMode()) {
            return this.darkTheme;
        }
        return this.lightTheme;
    }
}

