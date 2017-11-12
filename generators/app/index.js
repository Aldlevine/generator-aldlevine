'use strict';
const Generator = require('yeoman-generator');
const fs = require('fs-extra');

module.exports = class extends Generator {
	async prompting() {
		const answers = await this.prompt([
			{
				type: 'input',
				name: 'title',
				message: 'Your project name (In Title Case)',
				default: this.appname
					.split('-')
					.map(chunk => {
						return chunk.charAt(0).toUpperCase() + chunk.slice(1);
					})
					.join(' ')
			},
			{
				type: 'input',
				name: 'author',
				message: 'Your name',
				default: this.user.git.name()
			},
			{
				type: 'input',
				name: 'email',
				message: 'Your email',
				default: this.user.git.email()
			},
			{
				type: 'input',
				name: 'description',
				message: 'Description of your project',
				default: ''
			},
			{
				type: 'input',
				name: 'license',
				message: 'License',
				default: 'MIT'
			},
			{
				type: 'confirm',
				name: 'monorepo',
				message: 'Is this a monorepo?',
				default: false
			}
		]);

		this.props = answers;
		this.props.name = answers.title.toLowerCase().replace(' ', '-');
		this.props.source = answers.monorepo ? 'packages' : 'src';
	}

	writing() {
		this.fs.copyTpl(
			this.templatePath('README.md'),
			this.destinationPath('README.md'),
			this.props
		);

		this.fs.commit(() => {
			this.spawnCommandSync('git', ['add', '--all']);
			this.spawnCommandSync('git', [
				'commit',
				'-m',
				'"Initial commit with README.md"',
				'--quiet'
			]);

			this.fs.copyTpl(
				this.templatePath('**/!(README.md)'),
				this.destinationPath('.'),
				this.props,
				{},
				{globOptions: {dot: true}}
			);

			fs.ensureDirSync(this.destinationPath(this.props.source));
		});
	}

	initializing() {
		this.spawnCommandSync('git', ['init', '--quiet']);
	}

	install() {
		this.installDependencies({
			npm: true,
			bower: false
		}).then(() => {
			fs.ensureDirSync(this.destinationPath('.git/logs'));
			this.spawnCommandSync('npm', ['run', 'update', '-s']);
		});
	}
};
