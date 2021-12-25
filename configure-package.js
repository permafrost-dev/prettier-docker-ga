// @ts-nocheck
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * configures a package created from the template.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');
const cp = require('child_process');
const { basename } = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = util.promisify(rl.question).bind(rl);

const basePath = __dirname;

const packageInfo = {
    name: '',
    description: '',
    vendor: {
        name: '',
        github: '',
    },
    author: {
        name: '',
        email: '',
        github: '',
    },
    action: {
        name: '',
        baseimage: '',
        icon: 'check',
        color: 'blue',
    }
};

const runCommand = str => {
    cp.execSync(str, { cwd: __dirname, encoding: 'utf-8', stdio: 'inherit' });
};

const gitCommand = command => {
    return cp.execSync(`git ${command}`, { env: process.env, cwd: __dirname, encoding: 'utf-8', stdio: 'pipe' }) || '';
};

const askQuestion = async (prompt, defaultValue = '') => {
    let result = '';

    try {
        result = await question(`${prompt} ${defaultValue.length ? '(' + defaultValue + ') ' : ''}`);
    } catch (err) {
        result = false;
    }

    return new Promise(resolve => {
        if (!result || result.trim().length === 0) {
            result = defaultValue;
        }

        resolve(result);
    });
};

function rescue(func, defaultValue = null) {
    try {
        return func();
    } catch (e) {
        return defaultValue;
    }
}

function is_dir(path) {
    try {
        const stat = fs.lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

function is_symlink(path) {
    return rescue(() => fs.lstatSync(path).isSymbolicLink(), false);
}

function is_file(path) {
    return rescue(() => fs.lstatSync(path).isFile(), false);
}

const replaceVariablesInFile = (filename, packageInfo) => {
    let content = fs.readFileSync(filename, { encoding: 'utf-8' }).toString();
    const originalContent = content.slice();

    content = content
        .replace(/package-skeleton/g, packageInfo.name)
        .replace(/\{\{vendor\.name\}\}/g, packageInfo.vendor.name)
        .replace(/\{\{vendor\.github\}\}/g, packageInfo.vendor.github)
        .replace(/\{\{package\.name\}\}/g, packageInfo.name)
        .replace(/\{\{package\.description\}\}/g, packageInfo.description)
        .replace(/\{\{package\.author\.name\}\}/g, packageInfo.author.name)
        .replace(/\{\{package\.author\.email\}\}/g, packageInfo.author.email)
        .replace(/\{\{package\.author\.github\}\}/g, packageInfo.author.github)
        .replace(/\{\{package\.vendor\.name\}\}/g, packageInfo.vendor.name)
        .replace(/\{\{package\.vendor\.github\}\}/g, packageInfo.vendor.github)
        .replace(/\{\{package\.action\.name\}\}/g, packageInfo.action.name)
        .replace(/\{\{package\.action\.icon\}\}/g, packageInfo.action.icon)
        .replace(/\{\{package\.action\.color\}\}/g, packageInfo.action.color)
        .replace(/\{\{package\.action\.baseimage\}\}/g, packageInfo.action.baseimage)
        .replace(/\{\{date\.year\}\}/g, new Date().getFullYear())
        .replace('Template Setup: run `node configure-package.js` to configure.\n', '');

    if (originalContent != content) {
        fs.writeFileSync(filename, content, { encoding: 'utf-8' });
    }
};

const processFiles = (directory, packageInfo) => {
    const files = fs.readdirSync(directory).filter(f => {
        return ![
            '.',
            '..',
            '.git',
            '.github',
            '.editorconfig',
            '.gitattributes',
            '.gitignore',
            '.dockerignore',
            'configure-package.js',
        ].includes(path.basename(f));
    });

    files.forEach(fn => {
        const fqName = `${directory}/${fn}`;
        const relativeName = fqName.replace(basePath + '/', '');
        const isPath = is_dir(fqName);
        const kind = isPath ? 'directory' : 'file';

        console.log(`processing ${kind} ./${relativeName}`);

        if (isPath) {
            processFiles(fqName, packageInfo);
            return;
        }

        if (is_file(fqName)) {
            try {
                replaceVariablesInFile(fqName, packageInfo);
            } catch (err) {
                console.log(`error processing file ${relativeName}`);
            }
        }
    });
};

const conditionalAsk = async (obj, propName, onlyEmpty, prompt, allowEmpty = false, alwaysAsk = true) => {
    const value = obj[propName];

    if (!onlyEmpty || !value.length || alwaysAsk) {
        while (obj[propName].length === 0 || alwaysAsk) {
            obj[propName] = await askQuestion(prompt, value);

            if (allowEmpty && obj[propName].length === 0) {
                break;
            }

            if (obj[propName].length > 0) {
                break;
            }
        }
    }

    return new Promise(resolve => resolve());
};

const populatePackageInfo = async (onlyEmpty = false) => {
    const remoteUrlParts = gitCommand('config remote.origin.url').trim()
        .replace(':', '/')
        .split('/');

    console.log();

    packageInfo.name = basename(__dirname);
    packageInfo.author.name = gitCommand('config user.name').trim();
    packageInfo.author.email = gitCommand('config user.email').trim();
    packageInfo.vendor.name = packageInfo.author.name;
    packageInfo.author.github = remoteUrlParts[1];
    packageInfo.vendor.github = remoteUrlParts[1];

    await conditionalAsk(packageInfo, 'name', onlyEmpty, 'package name?', false);
    await conditionalAsk(packageInfo, 'description', onlyEmpty, 'package description?');
    await conditionalAsk(packageInfo.author, 'name', onlyEmpty, 'author name?');
    await conditionalAsk(packageInfo.author, 'email', onlyEmpty, 'author email?');
    await conditionalAsk(packageInfo.author, 'github', onlyEmpty, 'author github username?');
    await conditionalAsk(packageInfo.vendor, 'name', onlyEmpty, 'vendor name (default is author name)?', true);
    await conditionalAsk(packageInfo.vendor, 'github', onlyEmpty, 'vendor github org/user name (default is author github)?', true);

    await conditionalAsk(packageInfo.action, 'name', onlyEmpty, 'action name?');
    await conditionalAsk(packageInfo.action, 'icon', onlyEmpty, 'action icon name?');
    await conditionalAsk(packageInfo.action, 'color', onlyEmpty, 'action color?');
    await conditionalAsk(packageInfo.action, 'baseimage', onlyEmpty, 'Dockerfile base image?');

    if (packageInfo.vendor.name.length === 0) {
        packageInfo.vendor.name = packageInfo.author.name;
    }

    if (packageInfo.vendor.github.length === 0) {
        packageInfo.vendor.github = packageInfo.author.github;
    }

    if (packageInfo.action.name.length === 0) {
        packageInfo.action.name = `${packageInfo.vendor.name}-${packageInfo.name}`;
    }

    while(packageInfo.action.baseimage.length === 0) {
        await conditionalAsk(packageInfo.action, 'baseimage', onlyEmpty, 'Dockerfile base image?');

        if (packageInfo.action.baseimage.length > 0) {
            if (! packageInfo.action.baseimage.includes(':')) {
                packageInfo.action.baseimage += ':latest';
            }
            break;
        }
    }
};

const safeUnlink = path => fs.existsSync(path) && fs.unlinkSync(path);
const getWorkflowFilename = name => `${__dirname}/.github/workflows/${name}.yml`;
const getGithubConfigFilename = name => `${__dirname}/.github/${name}.yml`;

class Features {
    dependabot = {
        prompt: 'Use Dependabot?',
        enabled: true,
        dependsOn: [],
        disable: () => {
            safeUnlink(getGithubConfigFilename('dependabot'));
            this.automerge.disable();
        },
    };

    automerge = {
        prompt: 'Automerge Dependabot PRs?',
        enabled: true,
        dependsOn: ['dependabot'],
        disable: () => {
            safeUnlink(getWorkflowFilename('dependabot-auto-merge'));
        },
    };

    updateChangelog = {
        prompt: 'Use Changelog Updater Workflow?',
        enabled: true,
        dependsOn: [],
        disable: () => {
            safeUnlink(getWorkflowFilename('update-changelog'));
        },
    };

    features = [this.dependabot, this.automerge, this.updateChangelog];

    async run() {
        for (const feature of this.features) {
            if (feature.enabled) {
                feature.enabled = await askBooleanQuestion(feature.prompt, feature.default);

                if (!feature.enabled) {
                    feature.disable();
                }
            }
        }
    }
}

const askBooleanQuestion = async str => {
    const resultStr = await askQuestion(`${str} `);
    const result = resultStr.toString().toLowerCase()
        .replace(/ /g, '')
        .replace(/[^yn]/g, '')
        .slice(0, 1);

    return result === 'y';
};

const run = async function () {
    await populatePackageInfo();
    await new Features().run();

    const confirm = (await askQuestion('Process files (this will modify files)? '))
        .toString()
        .toLowerCase()
        .replace(/ /g, '')
        .replace(/[^yn]/g, '')
        .slice(0, 1);

    if (confirm !== 'y') {
        console.log('Not processing files: action canceled.  Exiting.');
        rl.close();
        return;
    }

    try {
        processFiles(__dirname, packageInfo);
    } catch (err) {
        //
    } finally {
        rl.close();
    }

    try {
        console.log('Done, removing configuration script.');
        fs.unlinkSync(__filename);
    } catch (err) {
        //
    }

    try {
        runCommand('git add .');

        console.log('file changes staged, run "git commit" to commit changes.');
        //runCommand('git commit -m"commit configured package files"');
    } catch (err) {
        //
    }
};

run();
