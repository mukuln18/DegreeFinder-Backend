const College = require("../models/college.model");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const slugify = require("slugify");

const createCollege = async (req, res) => {
  try {
    const { name } = req.body;

    // Parse courses if sent as string
    if (req.body.courses) {
      req.body.courses = JSON.parse(req.body.courses);
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true });
    let existingCollege = await College.findOne({ slug });
    let counter = 1;

    while (existingCollege) {
      slug = `${slugify(name, { lower: true })}-${counter}`;
      existingCollege = await College.findOne({ slug });
      counter++;
    }

    // Upload image to Cloudinary
    let imageUrl = null;

    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "colleges" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const college = new College({
      ...req.body,
      slug,
      image: imageUrl
    });

    await college.save();

    res.status(201).json({
      success: true,
      data: college
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getColleges = async (req, res) => {
  try {
    const {
      search,
      location,
      minFees,
      maxFees,
      minRanking,
      maxRanking,
      minPlacement,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const query = { status: "published" };

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by location
    if (location) {
      const locationsArray = location.split(",").map((loc) => loc.trim());

      query.location = {
        $in: locationsArray.map((loc) => new RegExp(loc, "i")),
      };
    }

    // Filter by fees
    if (minFees || maxFees) {
      query.fees = {};
      if (minFees) query.fees.$gte = Number(minFees);
      if (maxFees) query.fees.$lte = Number(maxFees);
    }

    // Ranking filter
    if (minRanking || maxRanking) {
      query.ranking = {};
      if (minRanking) query.ranking.$gte = Number(minRanking);
      if (maxRanking) query.ranking.$lte = Number(maxRanking);
    }

    // Placement filter
    if (minPlacement) {
      query.placementPercentage = { $gte: Number(minPlacement) };
    }

    let sortOption = { createdAt: -1 };

    if (sort) {
      sortOption = sort;
    }

    const colleges = await College.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await College.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      data: colleges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCollegeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const college = await College.findOne({ slug, status: "published" });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.json({
      success: true,
      data: college,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getCollegesForComparison = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Please provide college IDs"
      });
    }

    const idArray = ids.split(",");

    if (idArray.length < 2 || idArray.length > 3) {
      return res.status(400).json({
        success: false,
        message: "You must compare between 2 and 3 colleges"
      });
    }

    const colleges = await College.find({
      _id: { $in: idArray },
      status: "published"
    });

    if (!colleges.length) {
      return res.status(404).json({
        success: false,
        message: "Colleges not found"
      });
    }

    // Detect strongest values
    let strongest = {
      ranking: null,
      fees: null,
      placementPercentage: null
    };

    // Ranking (lower is better)
    const rankingSorted = colleges
      .filter(c => c.ranking != null)
      .sort((a, b) => a.ranking - b.ranking);

    if (rankingSorted.length) {
      strongest.ranking = rankingSorted[0]._id;
    }

    // Fees (lower is better)
    const feesSorted = colleges
      .filter(c => c.fees != null)
      .sort((a, b) => a.fees - b.fees);

    if (feesSorted.length) {
      strongest.fees = feesSorted[0]._id;
    }

    // Placement (higher is better)
    const placementSorted = colleges
      .filter(c => c.placementPercentage != null)
      .sort((a, b) => b.placementPercentage - a.placementPercentage);

    if (placementSorted.length) {
      strongest.placementPercentage = placementSorted[0]._id;
    }

    res.json({
      success: true,
      count: colleges.length,
      data: colleges,
      strongest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse courses
    if (req.body.courses) {
      req.body.courses = JSON.parse(req.body.courses);
    }

    // Upload new image if provided
    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "colleges" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      req.body.image = result.secure_url;
    }

    const updatedCollege = await College.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCollege) {
      return res.status(404).json({
        success: false,
        message: "College not found"
      });
    }

    res.json({
      success: true,
      data: updatedCollege
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findByIdAndDelete(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCollege,
  getColleges,
  getCollegeBySlug,
  getCollegesForComparison,
  updateCollege,
  deleteCollege,
};
