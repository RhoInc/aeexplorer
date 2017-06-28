import babel from 'rollup-plugin-babel';

export default {
    moduleName: 'aeexplorer',
    entry: 'src/index.js',
    dest: 'build/aeTable.js',
    format: 'umd',
    globals: {d3: 'd3'},
    external: ['d3'],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            presets: [
                ['es2015',
                {'modules': false}
                ]
            ],
            plugins: [
                'external-helpers'
            ],
            babelrc: false
        })
    ]
}
