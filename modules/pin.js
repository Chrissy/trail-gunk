const pin = `data:image/png;base64,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`

export default pin;