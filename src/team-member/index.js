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
        },
        id:{
            type: "number"
        },
        alt: {
            type: "string",
            source: "attribute",
            selector: "img",
            attribute: "alt",
            alt: ""
        },
        url: {
            type: "string",
            source: "attribute",
            selector: "img",
            attribute: "src"
        },
        imageSize: {
            type: 'string', 
            default: 'thumbnail'
        },
        socialLinks: {
            type: 'array',
            default: [ ],
            source: 'query',
            selector: '.wp-block-create-block-team-member-socialLinks ul li',
            query: {
                icon: {
                    source: 'attribute',
                    attribute: 'data-icon'
                },
                link: {
                    source: 'attribute',
                    selector: 'a',
                    attribute: 'href'
                },
            },
        },
    },
    edit: Edit,
    save: Save
} );