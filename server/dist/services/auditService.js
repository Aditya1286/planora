"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const models_1 = require("../models");
const logAudit = async (params) => {
    try {
        const ipAddress = params.req ? params.req.headers['x-forwarded-for'] || params.req.ip || '' : '';
        const userAgent = params.req ? params.req.headers['user-agent'] || '' : '';
        await models_1.AuditLog.create({
            userId: params.userId,
            userEmail: params.userEmail,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            details: params.details || {},
            ipAddress,
            userAgent,
        });
    }
    catch (error) {
        console.error('[AuditService] Failed to record audit log:', error);
    }
};
exports.logAudit = logAudit;
