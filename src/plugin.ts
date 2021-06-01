import { Plugin, ChartType, DoughnutController } from 'chart.js'
import CenterLabelOptions from './CenterLabelOptions'

declare type CenterPlugin<TType extends ChartType = ChartType> = Plugin<
    TType,
    CenterLabelOptions
>

export default {
    id: 'centerlabel',
    afterDraw: function (chart, _, options) {
        if (options) {
            const ctx = chart.ctx

            let innerRadius = (chart.chartArea.top - chart.chartArea.bottom) / 2
            if (chart.config.type == 'doughnut') {
                const meta = chart.getDatasetMeta(0)
                const controller = meta.controller as DoughnutController
                if (controller) innerRadius = controller.innerRadius
            }

            const fontStyle = options.fontFamily || 'Arial'
            const txt = options.text
            const color = options.color || '#000'
            const maxFontSize = options.maxFontSize || 75
            const sidePadding = options.sidePadding || 20
            const sidePaddingCalculated =
                (sidePadding / 100) * (innerRadius * 2)
            // Start with a base font of 30px
            ctx.font = '30px ' + fontStyle

            // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
            const stringWidth = ctx.measureText(txt).width
            const elementWidth = innerRadius * 2 - sidePaddingCalculated

            // Find out how much the font can grow in width.
            const widthRatio = elementWidth / stringWidth
            const newFontSize = Math.floor(30 * widthRatio)
            const elementHeight = innerRadius * 2

            // Pick a new font size so it will not be larger than the height of label.
            let fontSizeToUse = Math.min(
                newFontSize,
                elementHeight,
                maxFontSize
            )

            let minFontSize = options.minFontSize
            const lineHeight = options.lineHeight || 25
            let wrapText = false

            if (minFontSize === undefined) {
                minFontSize = 20
            }

            if (minFontSize && fontSizeToUse < minFontSize) {
                fontSizeToUse = minFontSize
                wrapText = true
            }

            // Set font settings to draw it correctly.
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2
            let centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2
            ctx.font = fontSizeToUse + 'px ' + fontStyle
            ctx.fillStyle = color

            if (!wrapText) {
                ctx.fillText(txt, centerX, centerY)
                return
            }

            const words = txt.split(' ')
            let line = ''
            const lines = []

            // Break words up into multiple lines if necessary
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' '
                const metrics = ctx.measureText(testLine)
                const testWidth = metrics.width
                if (testWidth > elementWidth && n > 0) {
                    lines.push(line)
                    line = words[n] + ' '
                } else {
                    line = testLine
                }
            }

            // Move the center up depending on line height and number of lines
            centerY -= (lines.length / 2) * lineHeight

            for (let n = 0; n < lines.length; n++) {
                ctx.fillText(lines[n], centerX, centerY)
                centerY += lineHeight
            }
            //Draw text in center
            ctx.fillText(line, centerX, centerY)
        }
    },
} as CenterPlugin
