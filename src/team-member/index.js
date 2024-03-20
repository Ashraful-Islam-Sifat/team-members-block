import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import Save from './save';


registerBlockType( 'create-block/team-member', {
    title: __('Team Member', 'teamteam-members'),
    description: __('A Team Member Item', 'teamteam-members'),
    parent: ['create-block/team-members'],
    icon: 'admin-users',
    supports: {
        reusable: false,
        html: false
    },
    attributes: {
        name: {
            type: "string",
            source: "html",
            selector: "h4"
        },
        bio: {
            type: "string",
            source: "html",
            selector: "p"
        }
    },
    edit: Edit,
    save: Save
} )