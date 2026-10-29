"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PromoCode_1 = require("../models/PromoCode");
const router = (0, express_1.Router)();
router.post('/validate', async (req, res) => {
    try {
        const { code, eventId, subtotal } = req.body;
        if (!code) {
            res.status(400).json({ success: false, message: 'Promo code is required.' });
            return;
        }
        const promo = await PromoCode_1.PromoCode.findOne({
            code: code.toUpperCase().trim(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() },
        });
        if (!promo) {
            res.status(404).json({ success: false, message: 'Invalid or expired promo code.' });
            return;
        }
        if (promo.usedCount >= promo.maxUses) {
            res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
            return;
        }
        if (promo.eventId && eventId && promo.eventId.toString() !== eventId) {
            res.status(400).json({ success: false, message: 'This promo code is not valid for this specific event.' });
            return;
        }
        const orderSubtotal = Number(subtotal) || 0;
        if (promo.minOrderValue && orderSubtotal < promo.minOrderValue) {
            res.status(400).json({
                success: false,
                message: `Minimum order value of $${promo.minOrderValue} required to apply this coupon.`,
            });
            return;
        }
        let calculatedDiscount = 0;
        if (promo.discountType === 'percentage') {
            calculatedDiscount = (orderSubtotal * promo.discountValue) / 100;
            if (promo.maxDiscount && promo.maxDiscount > 0) {
                calculatedDiscount = Math.min(calculatedDiscount, promo.maxDiscount);
            }
        }
        else {
            calculatedDiscount = Math.min(promo.discountValue, orderSubtotal);
        }
        res.json({
            success: true,
            message: `Promo code ${promo.code} applied!`,
            data: {
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                discountAmount: calculatedDiscount,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error validating promo code.' });
    }
});
exports.default = router;
