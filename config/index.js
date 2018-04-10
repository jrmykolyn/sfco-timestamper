module.exports = {
	defaults: {
		repoPath: '~/timestamper-dump',
		dumpFile: 'DUMP.md'
	},
	messages: {
		process: {
			success: 'Yay! You\'ve successfully padded your repo contributions!'
		},
		error: {
			default: 'Whoops! Something went wrong',
			limit: 'Whoops! It looks like `timestamper` has already been invoked today. If you absolutely must pad your repo activity with another meaningless commit, add the `--force` flag.'
		}
	},
};
