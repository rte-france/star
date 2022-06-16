package com.star.rest;


import com.star.dto.common.PageDTO;
import com.star.dto.site.SiteDTO;
import com.star.enums.InstanceEnum;
import com.star.enums.TechnologyTypeEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.mapper.site.SitePageMapper;
import com.star.models.site.ImportSiteResult;
import com.star.models.site.SiteCrteria;
import com.star.security.SecurityComponent;
import com.star.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.star.enums.InstanceEnum.PRODUCER;
import static org.apache.commons.collections4.CollectionUtils.isEmpty;


/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@RestController
@RequestMapping(SiteController.PATH)
public class SiteController {
    public static final String PATH = ApiRestVersion.VERSION + "/site";

    @Value("${instance}")
    private InstanceEnum instance;
    @Autowired
    private SiteService siteService;
    @Autowired
    private SitePageMapper sitePageMapper;
    @Autowired
    private SecurityComponent securityComponent;

    @Operation(summary = "Post a Site CSV file.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Create successfully site", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping("/create")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportSiteResult> importSite(@Parameter(description = "CSV file containing site data.")
                                                       @RequestParam MultipartFile file) throws BusinessException {
        ImportSiteResult importSiteResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteResult = siteService.importSite(file.getOriginalFilename(), streamReader, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.CREATED).body(importSiteResult);
    }


    @Operation(summary = "Update a Site CSV file.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Update successfully site", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "409", description = "Error in the file", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @PostMapping("/update")
    @PreAuthorize("!@securityComponent.isInstance('PRODUCER')")
    public ResponseEntity<ImportSiteResult> updateSite(@Parameter(description = "CSV file containing site to update.")
                                                       @RequestParam MultipartFile file) throws BusinessException {
        ImportSiteResult importSiteResult;
        try (Reader streamReader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            importSiteResult = siteService.updateSite(file.getOriginalFilename(), streamReader, instance);
        } catch (IOException | TechnicalException exception) {
            log.error("Echec de l'import  du fichier {}. Erreur : ", file.getOriginalFilename(), exception);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(isEmpty(importSiteResult.getDatas()) ? HttpStatus.CONFLICT : HttpStatus.OK).body(importSiteResult);
    }

    /**
     * Recherche multi-critère de site
     *
     * @param page
     * @param pageSize
     * @param order
     * @param bookmark
     * @param technologyType
     * @param producerMarketParticipantMrid
     * @param producerMarketParticipantName
     * @param siteName
     * @param substationName
     * @param substationMrid
     * @param siteIecCode
     * @param meteringPointMrId
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    @Operation(summary = "Find site by criteria.")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Found site", content = {@Content(mediaType = "application/json")}),
                    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
                    @ApiResponse(responseCode = "500", description = "Internal error", content = @Content)})
    @GetMapping
    public ResponseEntity<PageDTO<SiteDTO>> findSite(
            @Parameter(description = "Number of page per response")
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @Parameter(description = "Number of responses per page")
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize,
            @Parameter(description = "order search criteria.")
            @RequestParam(value = "order", required = false) String order,
            @Parameter(description = "bookmark search criteria")
            @RequestParam(value = "bookmark", required = false, defaultValue = "") String bookmark,
            @Parameter(description = "technologyType search criteria")
            @RequestParam(value = "technologyType", required = false) List<TechnologyTypeEnum> technologyType,
            @Parameter(description = "producerMarketParticipantMrid search criteria")
            @RequestParam(value = "producerMarketParticipantMrid", required = false) String producerMarketParticipantMrid,
            @Parameter(description = "producerMarketParticipantName search criteria")
            @RequestParam(value = "producerMarketParticipantName", required = false) String producerMarketParticipantName,
            @Parameter(description = "siteName search criteria")
            @RequestParam(value = "siteName", required = false) String siteName,
            @Parameter(description = "substationName search criteria")
            @RequestParam(value = "substationName", required = false) String substationName,
            @Parameter(description = "substationMrid search criteria")
            @RequestParam(value = "substationMrid", required = false) String substationMrid,
            @Parameter(description = "siteIecCode search criteria")
            @RequestParam(value = "siteIecCode", required = false) String siteIecCode,
            @Parameter(description = "meteringPointMrId search criteria")
            @RequestParam(value = "meteringPointMrId", required = false) String meteringPointMrId) throws BusinessException, TechnicalException {
        Sort sort = order == null ? Sort.unsorted() : Sort.by(order);
        PageRequest pageRequest = PageRequest.of(page, pageSize, sort);
        SiteCrteria criteria = SiteCrteria.builder().meteringPointMrId(meteringPointMrId).producerMarketParticipantMrid(producerMarketParticipantMrid)
                .producerMarketParticipantName(producerMarketParticipantName).siteIecCode(siteIecCode).substationMrid(substationMrid)
                .substationName(substationName).siteName(siteName).technologyType(technologyType).instance(instance).build();
        if (PRODUCER.equals(instance)) {
            criteria.setProducerMarketParticipantMrid(securityComponent.getProducerMarketParticipantMrid(true));
        }
        return ResponseEntity.status(HttpStatus.OK).body(sitePageMapper.beanToDto(siteService.findSite(criteria, bookmark, pageRequest)));
    }
}
