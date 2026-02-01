"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseStudiesModule = void 0;
const common_1 = require("@nestjs/common");
const case_studies_service_1 = require("./case-studies.service");
const case_studies_controller_1 = require("./case-studies.controller");
let CaseStudiesModule = class CaseStudiesModule {
};
exports.CaseStudiesModule = CaseStudiesModule;
exports.CaseStudiesModule = CaseStudiesModule = __decorate([
    (0, common_1.Module)({
        controllers: [case_studies_controller_1.CaseStudiesController],
        providers: [case_studies_service_1.CaseStudiesService],
        exports: [case_studies_service_1.CaseStudiesService],
    })
], CaseStudiesModule);
//# sourceMappingURL=case-studies.module.js.map