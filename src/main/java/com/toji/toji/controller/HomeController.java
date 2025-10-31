package com.toji.toji.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

  @GetMapping("/")
  public String home(Model model) {
    model.addAttribute("title", "토지 - VWorld 연속지적도");
    return "index";
  }

  @GetMapping("/address-search-modal")
  public String addressSearchModal(Model model) {
    model.addAttribute("title", "주소검색 모달");
    return "addressSearchModal";
  }
}
