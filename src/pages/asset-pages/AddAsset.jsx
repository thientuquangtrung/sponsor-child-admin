import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader, PageHeaderHeading } from '@/components/common/PageHeader';
import Dropzone from '@/components/common/Dropzone';
import FilesUploadTable from '@/components/asset-components/FilesUploadTable';
import useFileSelection from '@/hooks/useFileSelection';
import AddAssetForm from '@/components/asset-components/AddAssetForm';
import ButtonLoading from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAddAssetChunkMutation } from '@/redux/asset/assetApi';
import { useDispatch, useSelector } from 'react-redux';
import { AddUpload, RemoveUpload, UpdateUploadProgress } from '@/redux/app/appActionCreators';

const formSchema = z.object({
    name: z.string().min(2).max(50),
    type: z.enum(['3DT', 'CLIP'], { message: 'Please select a valid asset type.' }),
    is_downloadable: z.boolean(),
});

const CHUNK_SIZE = 5 * 10 * 1024 * 1024; // 50MB

export default function AddAsset() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { uploads } = useSelector((state) => state.app);
    const { addFiles, removeFiles, selectedFiles } = useFileSelection();
    const [addAssetChunk, { isLoading }] = useAddAssetChunkMutation();

    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
        addFiles(acceptedFiles);
    }, []);

    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            type: '',
            is_downloadable: false,
        },
    });

    // 2. Define a submit handler.
    // function onSubmit(values) {
    //     // Do something with the form values.
    //     // ✅ This will be type-safe and validated.
    //     const formData = new FormData();
    //     selectedFiles.forEach((file) => {
    //         formData.append('files', file);
    //     });

    //     formData.append('name', values.name);
    //     formData.append('type', values.type);
    //     formData.append('is_downloadable', values.is_downloadable);
    //     formData.append('is_public', false);

    //     addAsset(formData);
    // }

    const onSubmitV2 = async (values) => {
        const totalFiles = selectedFiles.length;
        const uploadId = Math.floor(Math.random() * 1000000);
        dispatch(
            AddUpload({
                progress: 0,
                fileName: values.name,
                id: uploadId,
                totalFiles,
            }),
        );

        for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
            const file = selectedFiles[fileIndex];
            const fileSize = file.size;
            const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
            const project = 'prj2024';
            const version = 'v1';

            for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
                // // check if this upload has been cancelled
                // if (uploads[uploadId]?.cancelled) {
                //     dispatch(RemoveUpload(uploadId));
                //     return;
                // }

                const start = chunkNumber * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, fileSize);
                const chunk = file.slice(start, end);

                await uploadChunkHandler({
                    uploadId,
                    chunk,
                    chunkNumber,
                    totalChunks,
                    fileName: file.name,
                    project,
                    version,
                    metadata: values,
                });

                const progress = Math.round(((chunkNumber + 1) / totalChunks) * 100);
                console.log(progress);
                dispatch(UpdateUploadProgress({ uploadId, progress }));

                // // Check upload status
                // checkUploadStatus(file.name);
            }
        }

        dispatch(RemoveUpload(uploadId));
    };

    const uploadChunkHandler = async ({
        uploadId,
        chunk,
        chunkNumber,
        totalChunks,
        fileName,
        project,
        version,
        metadata,
    }) => {
        const formData = new FormData();
        formData.append('name', metadata.name);
        formData.append('type', metadata.type);
        formData.append('is_downloadable', metadata.is_downloadable);
        formData.append('is_public', false);

        formData.append('uploadId', uploadId);
        formData.append('chunk', chunk);
        formData.append('chunkNumber', chunkNumber);
        formData.append('totalChunks', totalChunks);
        formData.append('fileName', fileName);
        formData.append('project', project);
        formData.append('version', version);

        return addAssetChunk(formData).unwrap();
    };

    return (
        <div className="min-h-screen">
            <PageHeader>
                <PageHeaderHeading>Add New Asset</PageHeaderHeading>
            </PageHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitV2)}>
                    <div className="flex flex-wrap gap-4 my-4">
                        <Card className="flex-2 w-full">
                            <CardHeader>
                                {/* <CardTitle>Card Title</CardTitle> */}
                                <CardDescription>
                                    You can drag and drop multiple files and directories onto this page. Zip files are
                                    also supported.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dropzone onDrop={onDrop} />
                            </CardContent>
                        </Card>
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Uploaded Files</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* <p>No files uploaded</p> */}
                                <div className="max-h-[300px] overflow-y-auto">
                                    <FilesUploadTable files={selectedFiles} removeFiles={removeFiles} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Setting</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* <p className="text-muted-foreground italic text-center">No settings available</p> */}
                                <AddAssetForm form={form} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex gap-4 justify-end mb-8">
                        <Button
                            onClick={() => {
                                navigate('/assets');
                            }}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <ButtonLoading type="submit">Save</ButtonLoading>
                    </div>
                </form>
            </Form>
        </div>
    );
}
