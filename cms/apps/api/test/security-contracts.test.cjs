require('ts-node/register');

const assert = require('node:assert/strict');
const test = require('node:test');
const { HttpException } = require('@nestjs/common');
const { LoginRateLimitGuard } = require('../src/common/rate-limit.guard');
const { SettingsService } = require('../src/settings/settings.service');

test('masks stored secrets and preserves a masked value on update', async () => {
    let transactions = 0;
    const prisma = {
        setting: {
            findMany: async () => [
                { key: 'site_name', value: 'Astauria', type: 'string' },
                { key: 'whatsapp_api_token', value: 'top-secret', type: 'string' },
            ],
            upsert: args => args,
        },
        $transaction: async values => {
            transactions += 1;
            return values;
        },
    };
    const service = new SettingsService(prisma);

    assert.deepEqual(await service.getAllMasked(), {
        site_name: 'Astauria',
        whatsapp_api_token: '••••••••',
    });

    await service.updateAll({ whatsapp_api_token: '••••••••' });
    assert.equal(transactions, 0);
});

test('login limiter rejects the eleventh request from one address', () => {
    const guard = new LoginRateLimitGuard();
    const headers = {};
    const context = {
        switchToHttp: () => ({
            getRequest: () => ({ ip: '203.0.113.77' }),
            getResponse: () => ({
                setHeader: (name, value) => {
                    headers[name] = value;
                },
            }),
        }),
    };

    for (let attempt = 0; attempt < 10; attempt += 1) {
        assert.equal(guard.canActivate(context), true);
    }
    assert.throws(
        () => guard.canActivate(context),
        error => error instanceof HttpException && error.getStatus() === 429,
    );
    assert.ok(Number(headers['Retry-After']) > 0);
});
