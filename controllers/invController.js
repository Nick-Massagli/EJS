const invModel = require("../models/inventory-model");
const utilities = require("../utilities/index");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};


/* ***************************
 *  Build inventory details by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getSingleInventory(inv_id)
  const grid = await utilities.buildDetailGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].inv_make + " " + data[0].inv_model
  res.render("./inventory/details", {
    title: className,
    nav,
    grid,
  })
}

/****************************
 * Serve the management view
 * ************************** */
invCont.buildManagementView = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } catch (err) {
    console.error("Error serving the management view: ", err);
    res.status(500).send("Server Error");
  }
};
/* ***************************
 *  Render Add Classification View
 * ************************** */
invCont.renderAddClassification = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  } catch (err) {
    console.error("Error rendering add-classification view: ", err);
  }
};
/* ***************************
 *  Handle Add Classification Form Submission
 * ************************** */
invCont.addClassification = async (req, res) => {
  try {
    const { classification_name } = req.body;
    // Insert new classification into the database
    const result = await invModel.insertClassification(classification_name);
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav();
    if (result) {
      // Flash success message and render management view
      req.flash("notice", "Classification added successfully.");
      res.status(201).render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationList,
      })
    } else {
      // Handle failure to add classification
      const nav = await utilities.getNav();
      req.flash("notice", "Failed to add classification.");
      res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("notice", "Error adding classification. Please try again.");
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
  });
  }
};
/* ***************************
 *  Render Add Inventory View
 * ************************** */
invCont.renderAddInventory = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(); // Generate the select list for classifications
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
    });
  } catch (err) {
    console.error("Error rendering add-inventory view:", err);
    res.status(500).send("Server Error");
  }
};
/* ***************************
 *  Handle Add Inventory Form Submission
 * ************************** */
invCont.addInventory = async (req, res) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail } = req.body;
  const nav = await utilities.getNav();
  try {
    // Ensure that you're passing the values individually, not as an object
    const result = await invModel.insertInventory(
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    );
    // If result is truthy, vehicle was added successfully
    if (result.rowCount > 0) {
      req.flash("notice", "Vehicle added successfully.");
      const classificationList = await utilities.buildClassificationList();
      res.status(201).render("./inventory/management", {   
        title: "Inventory Management",
        nav,
        classificationList,
        errors: null,
      });
    } else {
      // Handle case where insert did not succeed
      req.flash("notice", "Error adding new vehicle. Please try again.");
      const classificationList = await utilities.buildClassificationList();
      res.status(501).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      });
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("notice", `Error adding new vehicle: ${inv_make} ${inv_model}`);
    const classificationList = await utilities.buildClassificationList();
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

module.exports = invCont;