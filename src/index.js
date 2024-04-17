import { registerBlockType, createBlock } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './team-member';

registerBlockType( metadata.name, {
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,

	transforms: {
		from: [
			{
				type: 'block',
				blocks: ['core/gallery'],
				transform: ( {images, columns} ) => {
					const innerBlocks = images.map(({url, id, alt})=> {
						return createBlock( 'create-block/team-member', {
							alt,
							id,
							url
						} );
					})
					return createBlock("create-block/team-members", {
						columns: columns || 2 
					}, innerBlocks)
				}

			},
			{
				type: 'block',
				blocks: [ 'core/image' ],
				isMultiBlock: true,
				transform: (attributes) => {
					const innerBlocks = attributes.map(({url, id, alt})=> {
						return createBlock( 'create-block/team-member', {
							alt,
							id,
							url
						} );
					});
					return createBlock("create-block/team-members", {
						columns: attributes.length > 3 ? 3 : attributes.length,
					}, innerBlocks)
				}
			}
		]
	}
} );
