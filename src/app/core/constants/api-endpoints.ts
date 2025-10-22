import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  private PATH1: string = `${environment.baseURL}`;
  
  // User Management
  public auth = {
    login: `${this.PATH}/auth/login`,
    verifyMobile: `${this.PATH}/auth/verify-mobile`,
    resendOtp: `${this.PATH}/auth/resend-mobile-otp`,
    logout: `${this.PATH}/auth/logout`,
    refreshToken: `${this.PATH}/auth/refresh-token`
  };

  public dashboard = {
    getUserDataCounts: `${this.PATH}/getUserDataCounts`,
    getUserEventCounts: `${this.PATH1}/mobile/getUserEventCounts`,
  };

    public events = {
      nextNearestEvent: `${this.PATH}/next-nearest-event`,
      getAllUpcomingEvents: `${this.PATH}/getAllUpcomingEvents`,
      getAllRecentEvents: `${this.PATH}/getAllRecentEvents`,
      getEventGallery: `${this.PATH}/getEventGallery`,
      getEvents1: `${this.PATH1}/mobile/getEvents1`,
      getUserEvents: `${this.PATH1}/mobile/getUserEvents`
    };

  public notifications = {
    getNotifications: `${this.PATH}/getNotificationsById`
  };

  public profile = {
    getProfileCompletion: `${this.PATH}/getProfileCompletion`,
    getUserProfile: `${this.PATH1}/mobile/get-users`,
    updateUserProfile: `${this.PATH1}/admin/update-register-user`,
    deleteAccount: `${this.PATH}/getPointsHistory1`,
    uploadProfilePic: `${this.PATH1}/admin/update-register-user`
  };

  public regions = {
    getAllRegions: `${this.PATH1}/admin/getAllRegions`
  };

  public locations = {
    getAllCountries: `${this.PATH1}/admin/getAllCountries`,
    getAllStates: `${this.PATH1}/admin/getAllStates`,
    getAllCities: `${this.PATH1}/admin/getCities`
  };

  public testimonials = {
    getTestimonialByUserId: `${this.PATH}/getTestimonialByUserId`
  };

  // Referral Management
  public referrals = {
    getGivenReferral: `${this.PATH1}/mobile/get-given-referral`,
    getReceivedReferral: `${this.PATH1}/mobile/get-received-referral`,
    getInsideUsers: `${this.PATH1}/mobile/get-inside-users`,
    getOutsideUsers: `${this.PATH1}/mobile/get-outside-users`,
    createReferral: `${this.PATH1}/mobile/create-referral`,
    updateReferral: `${this.PATH1}/mobile/update-referral`,
    deleteReferral: `${this.PATH1}/mobile/delete-referral`,
    getReferralStats: `${this.PATH1}/mobile/referral-stats`
  };

  // Tyfcb Management
  public tyfcb = {
    getTyfcbById: `${this.PATH1}/mobile/getTyfcbById`,
    createTyfcb: `${this.PATH1}/mobile/create-tyfcb`,
    getTyfcbsByGiverId: `${this.PATH1}/mobile/get-tyfcbs-by-giverId`,
    getTyfcbsByReceiverId: `${this.PATH1}/mobile/get-tyfcbs-by-receiverId`
  };

 // Gratitude Management
  public gratitude = {
    getTestimonialsByReceiverId: `${this.PATH1}/mobile/get-testimonials-byReceiver`,
    getTestimonialRequestsByReceiverId: `${this.PATH1}/mobile/get-testimonial-req/receiver`,
    createTestimonial: `${this.PATH1}/mobile/create-testimonials`,
    getAllUsersData: `${this.PATH1}/mobile/getAllUsersData`
  };

    // OneToOne Management
  public growthMeet = {
    createGrowthMeet: `${this.PATH1}/mobile/create-oneToOne`,
    getOneToOneById: `${this.PATH1}/mobile/getOneToOneById`,
    getInitiatedOneToOne: `${this.PATH1}/mobile/getInitiated-oneToOne`,
    getInitiatedByOthers: `${this.PATH1}/mobile/getNotInitiated-oneToOne`
  };
  
  public attendance = {
  getAllAttendance: `${this.PATH}/getAllAttendance`
};

public leaderboard = {
  getPointsHistory: `${this.PATH}/getPointsHistory1`
};

public complaint= {
  createComplaint: `${this.PATH}/addComplanits`,
  getComplaints:`${this.PATH}/getComplaints`,
  getComplaintById:`${this.PATH}/getComplaintById`,
  updateComplaint:`${this.PATH}/updateComplaint`,
  deleteComplaint:`${this.PATH}/updateComplaint`,
  getComplaintStats:`${this.PATH}/updateComplaint`
}

public suggestion = {
  createSuggestion: `${this.PATH1}/mobile/createSuggestion`,
  getSuggestions: `${this.PATH1}/mobile/getSuggestions`,
  getSuggestionById: `${this.PATH1}/mobile/getSuggestion`,
  updateSuggestion: `${this.PATH1}/mobile/updateSuggestion`,
  deleteSuggestion: `${this.PATH1}/mobile/deleteSuggestion`,
  getSuggestionStats: `${this.PATH1}/mobile/suggestionStats`
}


// router.post('/getPointsHistory1', leaderboardController.getPointsHistory1);



}

export let apiEndpoints = new ApiEndpoints();