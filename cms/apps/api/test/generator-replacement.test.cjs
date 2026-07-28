require('ts-node/register');

const assert = require('node:assert/strict');
const test = require('node:test');
const {
    replaceElementByClass,
    replaceElementContent,
} = require('../src/generator/generator.service');

test('replaces a nested section without consuming following markup', () => {
    const input = [
        '<main>',
        '<div class="grid target x"><div><div>nested</div></div><p>old</p></div>',
        '<aside>keep</aside>',
        '</main>',
    ].join('');

    const output = replaceElementContent(input, 'target', '<article>new</article>');

    assert.match(output, /CMS:target:START/);
    assert.match(output, /<article>new<\/article>/);
    assert.match(output, /<aside>keep<\/aside>/);
    assert.doesNotMatch(output, /nested/);
});

test('uses stable markers on subsequent replacements', () => {
    const input = '<div class="target"><div>old</div></div>';
    const first = replaceElementContent(input, 'target', '<p>first</p>');
    const second = replaceElementContent(first, 'target', '<p>second</p>');

    assert.equal((second.match(/CMS:target:START/g) || []).length, 1);
    assert.doesNotMatch(second, /first/);
    assert.match(second, /second/);
});

test('can safely replace the complete matched element', () => {
    const input = '<div class="target"><div>old</div></div><footer>keep</footer>';
    const output = replaceElementByClass(
        input,
        'target',
        '<section class="target">new</section>',
    );

    assert.equal(output, '<section class="target">new</section><footer>keep</footer>');
});
