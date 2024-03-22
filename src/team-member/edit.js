import {useBlockProps, RichText, MediaPlaceholder, BlockControls, MediaReplaceFlow, InspectorControls} from "@wordpress/block-editor";
import { __ } from '@wordpress/i18n';
import { isBlobURL, revokeBlobURL } from "@wordpress/blob";
import { Spinner, withNotices, ToolbarButton, PanelBody, TextareaControl } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";

function Edit({attributes, setAttributes, noticeOperations, noticeUI}) {

    const {name, bio, id, alt, url} = attributes;

    const [blobURl, setBlobURL] = useState();

    const onChangeName = (newName) => {
        setAttributes({name: newName})
    }

    const onChangeBio = (newBio) => {
        setAttributes({bio:newBio})
    }

    const onChangeAlt = (newAlt) => {
        setAttributes( { alt: newAlt } )
    }

    const onSelectImage = (newImage) => {
        if( !newImage || !newImage.url ) {
            setAttributes( { url: undefined, id: undefined, alt: ''} );
            return;
        }
        setAttributes( { id:newImage.id, url:newImage.url, alt:newImage.alt } )
    }

    const onSelectURL = (newURL) => {
        setAttributes( {
            url: newURL,
            id: undefined,
            alt: ''
        } )
    }

    const onUploadError = (message) => {
        noticeOperations.removeAllNotices();
        noticeOperations.createErrorNotice(message);
    }

    const onRemoveImage = () => {
        setAttributes( {
            url: undefined,
            alt: '',
            id: undefined
        } )
    }

    useEffect(()=> {
        if(!id && isBlobURL(url)) {
            setAttributes({
                url: undefined,
                alt: ''
            })
        }
    }, [])

    useEffect(()=>{
        if(isBlobURL(url)){
            setBlobURL(url);
        }else{
            revokeBlobURL( blobURl );
            setBlobURL();
        }
    }, [url])

    return (
        <>

        <InspectorControls>
            { url && !isBlobURL(url) &&
            <PanelBody title={ __( 'Image Settings', 'team-members' ) }>
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
            }`}>
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
        />
         <RichText 
            placeholder={__('Bio', 'team-members')}
            tagName="p"
            onChange={onChangeBio}
            value={bio}
            allowedFormats={[ ]}
        />
    </div>
    </>
    )
}

export default withNotices( Edit );