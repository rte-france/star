package com.star.mapper.reservebid;

import com.star.dto.reservebid.ReserveBidDTO;
import com.star.models.reservebid.ReserveBid;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ReserveBidMapper {
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "attachmentsWithStatus", ignore = true)
    ReserveBid dtoToBean(ReserveBidDTO reserveBidDTO);
}

