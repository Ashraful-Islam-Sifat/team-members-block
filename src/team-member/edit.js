import {useBlockProps, RichText, MediaPlaceholder, BlockControls, store as blockEditorStore, MediaReplaceFlow, InspectorControls} from "@wordpress/block-editor";
import { __ } from '@wordpress/i18n';
import { isBlobURL, revokeBlobURL } from "@wordpress/blob";
import { Spinner, withNotices, ToolbarButton, PanelBody, Button, TextControl, TextareaControl, SelectControl, Icon, Tooltip } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { useEffect, useState, useRef } from "@wordpress/element";
import { usePrevious } from "@wordpress/compose";
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableItem from "./sortable-item";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

function Edit({attributes, setAttributes, noticeOperations, noticeUI, isSelected}) {

    const {name, bio, id, alt, url, imageSize, socialLinks} = attributes;
    const [blobURl, setBlobURL] = useState();
    const [ selectedLink, setSelectedLink ] = useState()

    const titleRef = useRef();
    const prevURL = usePrevious(url);
    const prevSelected = usePrevious(isSelected);
    const sensors = useSensors( useSensor( PointerSensor, {
        activationConstraint: { distance: 5 }
    } ) );

//** There is problem on line 31. The sizes object shouldn't be empty.  */
    // const imageObject = useSelect(
    //     (select)=> {
    //         const { getMedia } = select( 'core' );
    //         return id ? getMedia(id) : null ;

    //     },
    //     [id]
    // );

    // const imageSizes = useSelect( ( select ) => {
    //     return select( blockEditorStore ).getSettings().imageSizes;
    // }, [] );

    // const getImageSizeOptions = () => {
    //     if ( !imageObject ) return [];
    //     const options = [];
    //     const sizes = imageObject.media_details.sizes;
    //     for ( const key in sizes ) {
    //         const size = sizes[key];
           
    //         const imageSize = imageSizes.find( (s) => s.slug === key );
           
    //         if ( imageSize ) {
    //             options.push( {
    //                 label: imageSize.name,
    //                 value: size.source_url
    //             } )
    //         }
    //     }
    //     return options;
       
    // }

    const onChangeName = (newName) => {
        setAttributes({name: newName})
    };

    const onChangeBio = (newBio) => {
        setAttributes({bio:newBio})
    };

    const onChangeAlt = (newAlt) => {
        setAttributes( { alt: newAlt } )
    }

    const onSelectImage = (newImage) => {
        if( !newImage || !newImage.url ) {
            setAttributes( { url: undefined, id: undefined, alt: ''} );
            return;
        }
        setAttributes( { id:newImage.id, url:newImage.url, alt:newImage.alt } )
    };

    const onSelectURL = (newURL) => {
        setAttributes( {
            url: newURL,
            id: undefined,
            alt: ''
        } )
    };

    const onChangeImageSize = (newSize) =>{
        setAttributes( { imageSize : newSize } );
    };

    const onUploadError = (message) => {
        noticeOperations.removeAllNotices();
        noticeOperations.createErrorNotice(message);
    };

    const onRemoveImage = () => {
        setAttributes( {
            url: undefined,
            alt: '',
            id: undefined
        } )
    };

    const addNewSocialItem = () => {
        setAttributes( {
            socialLinks: [ ...socialLinks, { icon: 'wordpress', link: '' } ]
        } );
        setSelectedLink(socialLinks.length);
    };

    const updateSocialItem = ( type, value ) => {
        const socialLinksCopy = [...socialLinks];
        socialLinksCopy[ selectedLink ][ type ] = value;
        setAttributes( {socialLinks: socialLinksCopy} )
    };

    const removeSocialItem = () => {
        setAttributes( {
            socialLinks: [
                ...socialLinks.slice(0, selectedLink),
                ...socialLinks.slice(selectedLink + 1),
            ],
            
        } );
        setSelectedLink();
    }

    const handleDragEnd = (event) => {
        const {active, over} = event;
        if( active && over && active.id !== over.id) {
            const oldIndex = socialLinks.findIndex(
                (i) => active.id == `${i.icon}-${i.link}`
            );
            const newIndex =  socialLinks.findIndex(
                (i) => over.id == `${i.icon}-${i.link}`
            );
            setAttributes({
                socialLinks: arrayMove(socialLinks, oldIndex, newIndex)
            })
            setSelectedLink(newIndex)
        }
    };

    useEffect(()=> {
        if(!id && isBlobURL(url)) {
            setAttributes({
                url: undefined,
                alt: ''
            })
        }
    }, []);

    useEffect(()=>{
        if(isBlobURL(url)){
            setBlobURL(url);
        }else{
            revokeBlobURL( blobURl );
            setBlobURL();
        }
    }, [url]);

    useEffect(()=> {
        if( url && !prevURL && isSelected ){
            titleRef.current.focus()
        }
    }, [url, prevURL]);

    useEffect(()=> {
        if( prevSelected && !isSelected ){
            setSelectedLink();
        }
    }, [isSelected, prevSelected]);

    return (
        <>

        <InspectorControls>
            { url && !isBlobURL(url) &&
            <PanelBody title={ __( 'Image Settings', 'team-members' ) }>
            {id && (
                <SelectControl
                    label= { __( 'Image Size', 'team-members' ) }
                    options={[
                        { label: __('Thumbnail'), value: 'thumbnail' },
                        { label: __('Medium'), value: 'medium' },
                        { label: __('Large'), value: 'large' },
                    ]}
                    value={ imageSize }
                    onChange={ onChangeImageSize }
                />
            )}
            
                <TextareaControl
                    label= { __( 'Alt Text', 'team-members' ) }
                    value={alt}
                    onChange={onChangeAlt}
                    help={ __(
                        "Alternative text describes your image to people can't see it. Add a short description with it's key details.", 'team-members'
                    ) }
                />
            </PanelBody> }
        </InspectorControls>
        
        <BlockControls goup="inline">
            <MediaReplaceFlow
                onSelect={ onSelectImage }
                onSelectURL={ onSelectURL }
                onError={ onUploadError }
                allowedTypes={ [ 'image' ] }
                accept="image/*"
                mediaId = {id}
                mediaURL = {url}
            />
            <ToolbarButton onClick={onRemoveImage}>
                {__('Remove Image', 'team-members')}
            </ToolbarButton>
        </BlockControls>
     <div {...useBlockProps()}>
        { url && (
            <div className={`wp-block-create-block-team-member-img${
                isBlobURL(url) ? ' is-loading' : ''
            } size-${imageSize}`}>
                 <img src={ url } alt= { alt } />
                 {isBlobURL(url) && <Spinner />}
            </div>
        ) }
        <MediaPlaceholder
        name={__('Replace Image', 'team-members')}
        icon="media-default"
        onSelect={ onSelectImage }
        onSelectURL={ onSelectURL }
        onError={ onUploadError }
        disableMediaButtons = { url }
        allowedTypes={ [ 'image' ] }
        notices={noticeUI}
        accept="image/*"
        />
        <RichText 
            placeholder={__('Member name', 'team-members')}
            tagName="h4"
            onChange= {onChangeName}
            value= {name}
            allowedFormats={[ ]}
            ref= { titleRef }
        />
         <RichText 
            placeholder={__('Bio', 'team-members')}
            tagName="p"
            onChange={onChangeBio}
            value={bio}
            allowedFormats={[ ]}
        />

        <div className="wp-block-create-block-team-member-socialLinks">
            <ul>
                <DndContext 
                    sensors={sensors} 
                    onDragEnd={handleDragEnd}
                    modifiers={ [ restrictToHorizontalAxis ] }
                >
                    <SortableContext
                        items={socialLinks.map(
                            (item) => `${item.icon}-${item.link}`
                        )}
                        strategy={ horizontalListSortingStrategy }
                    >
                        {socialLinks.map( (item, index) => {
                            return (
                                <SortableItem
                                key={`${item.icon}-${item.link}`}
                                id={`${item.icon}-${item.link}`}
                                index= {index}
                                selectedLink= {selectedLink}
                                setSelectedLink= {setSelectedLink}
                                icon= {item.icon}
                                />
                            )
                        })}
                    </SortableContext>
                </DndContext>

                {isSelected &&
                <li className="wp-block-create-block-team-member-add-icon-li">
                    <Tooltip text={__('Add Social Link', 'team-members')}>
                        <button
                        aria-label={__('Add Social Link', 'team-members')}
                        onClick={addNewSocialItem}
                        >
                            <Icon icon="plus" />
                        </button>
                    </Tooltip>
                </li>
                }  
            </ul>
        </div>

        {selectedLink !== undefined && 
        <div className="wp-block-create-block-team-member-link-form">
            <TextControl 
                label={ __('Icon', 'team-members') } 
                value={socialLinks[selectedLink].icon}
                onChange={ (icon) => updateSocialItem('icon', icon) }
            />
            <TextControl 
                label={ __('URL', 'team-members') } 
                value={socialLinks[selectedLink].link}
                onChange={ (link) => updateSocialItem('link', link) }
            />
            <br/>
            <Button isDestructive onClick={ removeSocialItem } >
            { __('Remove Link', 'team-members') }
            </Button>
        </div>}
    </div>
    </>
    )
}

export default withNotices( Edit );