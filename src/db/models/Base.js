"use strict";
const rfr = require("rfr");

const HistoricScaffoldModel = rfr("src/utils/slorm/HistoricScaffoldModel");

class BaseModel extends HistoricScaffoldModel {}

module.exports = BaseModel;
