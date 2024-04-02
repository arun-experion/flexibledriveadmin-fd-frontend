import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MARKETINTEL } from '../constant';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-market-intel',
  templateUrl: './market-intel.component.html',
  styleUrls: ['./market-intel.component.css']
})
export class MarketIntelComponent implements OnInit {
  blogTitle: string;
  blog: any;

  constructor(
    private route: ActivatedRoute,
    private $apiSer: ApiService,
    private toastr: ToastrService
  ) {
    this.blogTitle = this.route.snapshot.paramMap.get('title');
  }

  ngOnInit() {
    this.$apiSer.get(`${MARKETINTEL}/${this.blogTitle}`).subscribe(res => {
      try {
        const { success, message, data: blog } = res;
        if (success) {
          this.blog = blog;
        } else {
          this.toastr.warning(message);
        }
      } catch (error) {
        console.error(error);
        this.toastr.warning(res.message);
      }
    }, error => console.error(error), () => { })
  }

}
