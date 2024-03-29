import {Component, Input, OnChanges, SimpleChanges,} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {InstanceService} from 'src/app/services/api/instance.service';
import {Instance} from 'src/app/models/enum/Instance.enum';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {LimitationsGraphComponent} from '../limitations-graph/limitations-graph.component';
import {
  RechercheHistoriqueLimitationEntite,
  RechercheHistoriqueLimitationEntiteWithAnnotation
} from 'src/app/models/RechercheHistoriqueLimitation';
import {SystemOperator} from "../../../models/SystemOperator";
import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {TechnologyType} from 'src/app/models/enum/TechnologyType.enum';
import {DateHelper} from "../../../helpers/date.helper";
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";
import {Router} from "@angular/router";
import {PATH_ROUTE} from "../../../app-routing.module";
import {TypeImport} from "../../charger/charger.component";

@Component({
  selector: 'app-limitations-resultats',
  templateUrl: './limitations-resultats.component.html',
  styleUrls: ['./limitations-resultats.component.css'],
})
export class LimitationsResultatsComponent implements OnChanges {
  @Input() data: RechercheHistoriqueLimitationEntiteWithAnnotation[] = [];
  @Input() systemOperators: SystemOperator[] = [];
  @Input() columnsToDisplay: string[] = [];

  InstanceEnum = Instance;
  TypeSiteEnum = TypeSite;

  dataComputed: any = [];
  dataComputedSorted: any = [];

  instance?: Instance;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet,
    private router: Router,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.instanceService.getTypeInstance().subscribe((instance) => {
      this.instance = instance;
      this.computeData();
    });
  }

  private computeData() {
    this.dataComputed = this.fillMissingData(this.data);
    this.dataComputedSorted = [...this.dataComputed];
  }

  private fillMissingData(data: RechercheHistoriqueLimitationEntite[]) {
    let dataForComputation = [];
    for (let d of data) {
      if (d) {
        if (!d.site) {
          d.hasSite = false;
          d.site = {
            typeSite: TypeSite.HTB,
            producerMarketParticipantMrid: '---',
            producerMarketParticipantName: '---',
            siteName: '---',
            technologyType: TechnologyType.PHOTOVOLTAIQUE,
            meteringPointMrid: '---',
            siteAdminMrid: '---',
            siteLocation: '---',
            siteType: '---',
            substationName: '---',
            substationMrid: '---',
            systemOperatorEntityFlexibilityDomainMrid: '---',
            systemOperatorEntityFlexibilityDomainName: '---',
            systemOperatorCustomerServiceName: '---'
          }
        } else {
          d.hasSite = true;
        }
        if (!d.producer) {
          d.producer = {
            producerMarketParticipantMrid: '---',
            producerMarketParticipantName: '---',
            producerMarketParticipantRoleType: '---'
          }
          //d.activationDocument.originAutomationRegisteredResourceMrid = '---';
        }
      }
      dataForComputation.push(d);
    }
    return dataForComputation;
  }

  showGraph(activation: RechercheHistoriqueLimitationEntite) {
    var meteringPointMrid: string = "";
    if (activation.site) {
      meteringPointMrid = activation.site.meteringPointMrid;
    }

    var dataValue = {
      meteringPointMrid: meteringPointMrid,
      startCreatedDateTime: activation.activationDocument.startCreatedDateTime,
      endCreatedDateTime: activation.activationDocument.endCreatedDateTime,
      orderValueConsign: activation.activationDocument.orderValue,
      measurementUnitNameConsign: activation.activationDocument.measurementUnitName,
      showOnlyConsign: this.instance == Instance.PRODUCER && activation.activationDocument.eligibilityStatus != EligibilityStatus.OUI,
    }

    this.bottomSheet.open(LimitationsGraphComponent, {
      panelClass: 'graph-bottom-sheet',
      data: dataValue,
    });
  }

  public sortChange(sort: Sort) {
    // 1) No sort case
    if (sort.direction == "") {
      this.dataComputedSorted = [...this.dataComputed];
      return;
    }

    // 2) Find the sorting method
    let sortFunction: any = null;
    switch (sort.active) {
      case "debutLimitation":
        sortFunction = (d1: any, d2: any): number => {
          let ts1 = DateHelper.stringToTimestamp(d1.activationDocument.startCreatedDateTime);
          let ts2 = DateHelper.stringToTimestamp(d2.activationDocument.startCreatedDateTime);
          return sort.direction == "asc" ? ts1 - ts2 : ts2 - ts1;
        };
        break;
      case "finLimitation":
        sortFunction = (d1: any, d2: any): number => {
          let ts1 = DateHelper.stringToTimestamp(d1.activationDocument.endCreatedDateTime);
          let ts2 = DateHelper.stringToTimestamp(d2.activationDocument.endCreatedDateTime);
          return sort.direction == "asc" ? ts1 - ts2 : ts2 - ts1;
        };
        break;
    }

    // 3) Sort data
    if (sortFunction != null) {
      this.dataComputedSorted = [...this.dataComputed].sort((d1: any, d2: any) => sortFunction(d1, d2));
    }
  }

  public chargerEne(activation: RechercheHistoriqueLimitationEntite) {
    this.router.navigate(
      [PATH_ROUTE.CHARGER],
      {
        state: {
          typeImport: TypeImport.EneEni,
          formData: activation
        }
      });
  }

}
