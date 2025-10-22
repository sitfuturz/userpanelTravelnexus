import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Travel Nexus',
      menus: [
        // {
        //    title: 'Referrals',
        //    link: 'referrals',
        //    icon: 'corner-up-right',
        // },
        // {
        //   title: 'Tyfcbslip',
        //   link: 'tyfcbslip',
        //   icon: 'trending-up',
        // },
        {
          title:'Member Directory',
          link:'member',
        icon:'user'    },
        // {
        //   title: 'Gratitude',
        //   link: 'gratitude',
        //   icon: 'user-plus',
        // },
        // {
        //   title: 'Growth-meet',
        //   link: 'growth-meet',
        //   icon: 'file-import',
        // },
        {
          title: 'Events',
          link: 'event',
          icon: 'calendar',
        },

        {
          title:'Event History',
          link:'event-history',
          icon:'event-history'
        },
        // {
        //   title: 'Attendance',
        //   link: 'attendance',
        //   icon: 'check-circle',
        // },
        // {
        //   title: 'Leaderboard',
        //   link: 'leaderboard',
        //   icon: 'award',
        // },

        {
          title:'Complain',
          link:'complaint',
          icon: 'complaint'
        },
        {
          title:'suggestion',
          link:'suggestion',
          icon:'suggestion'
        }

      ],
    },
  ];

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }

  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}