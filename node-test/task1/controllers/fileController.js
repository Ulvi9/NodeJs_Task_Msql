const express = require('express');
const multer = require("multer");
const File = require('../models/File');
const asyncHandler = require('../middleware/async');
const path = require("path");
const HttpException = require("../utils/httpException");
const fs = require('fs');

// @desc      Upload
// @route     POST /api/file/upload
// @access    Public
exports.upload = (req, res, next) => {
    if (!req.file) return next(new HttpException(404, `Error:Please choose file`));
    const file = File.create({
        name: req.file.originalname,
        extension: req.file.mimetype.split('/')[1],
        mimeType: req.file.mimetype,
        size: req.file.size
    })
    res.status(201).send(file);
};

// @desc      Get All Files
// @route     GET /api/file/files
// @access    Public
exports.getFiles = asyncHandler(async (req, res, next) => {

    // Pagination
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const listSize = req.query.listSize ? parseInt(req.query.listSize) : 10;

    const result = await File.findAll({offset: (page - 1) * listSize, limit: listSize});

    res.status(200).json({
        success: true,
        data: result
    })
})

// @desc      Get single review
// @route     GET /api/file/file/:id
// @access    Public
exports.getFile = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const file = await File.findByPk(id);
    if (!file) return next(new HttpException(404, `No file with the id of ${req.params.id}`));
    res.status(200).json({
        success: true,
        data: file
    })
})

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateFile = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const file = await File.findByPk(id);
    if (!file) return next(new HttpException(404, `No file with the id of ${req.params.id}`));


    res.status(200).json({
        success: true,
        data: file
    })

})

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteFile = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const file = await File.findByPk(id);
    if (!file) return next(new HttpException(404, `No file with the id of ${req.params.id}`));

    const filePath = `./public/uploads/${file.dataValues.name}`;

    fs.unlink(filePath, (err) => {
        if (err) {
            console.log(err)
            return next(new HttpException(500, 'Server error'));
        }
        File.destroy({where: {id}})
        return res.status(200).send('File deleted')
    });

})

exports.download = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const file = await File.findByPk(id);
    const filePath = `./public/uploads/${file.dataValues.name}`;
    res.download(filePath);
})

exports.edit = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const file = req.file;
    const fileDb = await File.findByPk(id);
    console.log(fileDb)
    const fileUpdate = await File.update(
        {
            name: file.originalname,
            extension: file.mimetype.split('/')[1],
            mimeType: file.mimetype,
            size: file.size
        },
        {where: {id}}
    );
    if(fileUpdate){
        const filePath = `./public/uploads/${fileDb.dataValues.name}`;

        fs.unlink(filePath, (err) => {
            if (err) {
                return next(new HttpException(500, 'Server error'));
            }
            return res.status(200).send('File Update')
        });
    }
})
